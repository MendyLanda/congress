/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DBQueryConfig, SQL, SQLWrapper, Table } from "drizzle-orm";
import { and, isNull } from "drizzle-orm";

import type {
  AnyArgs,
  DbClient,
  DeleteArgs,
  DeleteFn,
  FindArgs,
  FindFn,
  FromArgs,
  FromFn,
  JoinArgs,
  JoinFn,
  QueryWhereFnArgs,
  SetArgs,
  SetFn,
  TransactionArgs,
  TransactionFn,
  UpdateArgs,
  WhereArgs,
  WhereFn,
} from "./types";
import * as schema from "../schema";

const ARCHIVED_COLUMN = "timeArchived" as const;

interface InvokeContext {
  path?: string[];
  fnPath?: { name: string; args: unknown[] }[];
}

interface InterceptFn {
  invoke: (...args: unknown[]) => unknown;
  name: string;
  args: unknown[];
}

interface OverrideFn {
  pattern: string | string[];
  action: () => unknown;
}

function getPolicy(table: Table | QueryWhereFnArgs[0]) {
  if (!(ARCHIVED_COLUMN in table)) {
    return;
  }
  return isNull(table[ARCHIVED_COLUMN]);
}

export const createRLSDBClient = <T extends DbClient>(db: T): T => {
  const intercept = (fn: InterceptFn, context: InvokeContext = {}) => {
    const { path = [], fnPath = [] } = context;

    const pathAsString = path.join(".");

    const matchPath = (pattern: string) => {
      return new RegExp(
        `^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`,
      ).test(pathAsString);
    };

    const overrides: OverrideFn[] = [
      {
        pattern: ["db.execute", "db.*.execute", "tx.execute", "tx.*.execute"],
        action: () => {
          throw new Error("'execute' in rls DB is not allowed");
        },
      },
      {
        pattern: [
          "db.query.findMany",
          "db.query.*.findMany",
          "db.query.findFirst",
          "db.query.*.findFirst",
          "tx.query.findMany",
          "tx.query.*.findMany",
          "tx.query.findFirst",
          "tx.query.*.findFirst",
        ],
        action: () => {
          const findFn = fn.invoke as FindFn;
          const findArgs = fn.args as FindArgs;

          const tableIndex = path.findIndex((x) => x === "query") + 1;
          const tableProperty = path[tableIndex]! as keyof typeof db.query;

          const table = schema[tableProperty];

          const policy = getPolicy(table);

          if (policy) {
            let [config] = findArgs;

            if (config?.where) {
              const originalWhere = config.where;

              const where =
                typeof originalWhere === "function"
                  ? (table: Table, helpers: any) => {
                      const userWhere = originalWhere(table as any, helpers);
                      return and(policy, userWhere);
                    }
                  : and(policy, originalWhere as SQLWrapper);

              config = {
                ...config,
                where: where as unknown as SQL,
              };
            }

            if (!config?.where) {
              config = {
                ...config,
                where: policy,
              };
            }

            if (config.with) {
              const processWithConfig = (
                // @ts-expect-error -- config is always defined at this point
                withConfig: typeof config.with,
              ): DBQueryConfig["with"] => {
                return (
                  Object.keys(withConfig) as (keyof typeof withConfig)[]
                ).reduce<DBQueryConfig["with"]>((acc, key) => {
                  const value = withConfig[key] as
                    | true
                    | null
                    | DBQueryConfig<"many">;

                  if (value === true) {
                    return {
                      ...acc,
                      [key]: {
                        where: (...args) => {
                          const [table] = args as QueryWhereFnArgs;

                          console.debug(
                            "Calling getPolicy from db/tx.query.*.find* with where",
                          );
                          const policy = getPolicy(table);
                          return policy;
                        },
                      },
                    };
                  }

                  if (typeof value === "object" && value !== null) {
                    return {
                      ...acc,
                      [key]: {
                        ...value,
                        with: value.with
                          ? processWithConfig(value.with)
                          : undefined,
                        where: (...args) => {
                          const [table] = args as unknown as QueryWhereFnArgs;

                          console.debug(
                            "Calling getPolicy from db/tx.query.*.find* with where in with",
                          );
                          const policy = getPolicy(table);

                          return policy
                            ? and(
                                policy,
                                typeof value.where === "function"
                                  ? value.where(...args)
                                  : value.where,
                              )
                            : typeof value.where === "function"
                              ? value.where(...args)
                              : value.where;
                        },
                      },
                    };
                  }

                  return { ...acc, [key]: value };
                }, {});
              };

              config = {
                ...config,
                with: processWithConfig(config.with),
              };
            }

            return findFn(...([config] as FindArgs));
          }

          return findFn(...findArgs);
        },
      },
      {
        pattern: ["db.*.from", "tx.*.from"],
        action: () => {
          const fromFn = fn.invoke as FromFn;
          const fromArgs = fn.args as FromArgs;

          const [table] = fromArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            return fromFn(...fromArgs).where(policy);
          }

          return fromFn(...fromArgs);
        },
      },
      {
        pattern: [
          "db.*.from.where",
          "db.*.from.*.where",
          "tx.*.from.where",
          "tx.*.from.*.where",
        ],
        action: () => {
          const whereFn = fn.invoke as WhereFn;
          const whereArgs = fn.args as WhereArgs;

          const [table] = fnPath.findLast((x) => x.name === "from")
            ?.args as FromArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            const [whereFilter] = whereArgs as [SQLWrapper];
            return whereFn(and(policy, whereFilter));
          }

          return whereFn(...whereArgs);
        },
      },
      {
        pattern: [
          "db.*.leftJoin",
          "db.*.rightJoin",
          "db.*.innerJoin",
          "db.*.fullJoin",
          "tx.*.leftJoin",
          "tx.*.rightJoin",
          "tx.*.innerJoin",
          "tx.*.fullJoin",
        ],
        action: () => {
          const joinFn = fn.invoke as JoinFn;
          const joinArgs = fn.args as JoinArgs;

          const [table, joinOptions] = joinArgs as unknown as [
            Table,
            SQLWrapper,
          ];

          const policy = getPolicy(table);

          if (policy) {
            return joinFn(table, and(policy, joinOptions));
          }

          return joinFn(...joinArgs);
        },
      },
      {
        pattern: ["db.insert.values", "tx.insert.values"],
        action: () => {
          return fn.invoke(...fn.args);

          // if (!tenantId) {
          //   return fn.invoke(...fn.args);
          // }

          // const table = fnPath[0]!.args[0]! as Table;

          // if (!(TENANT_ID_COLUMN in table)) {
          //   return fn.invoke(...fn.args);
          // }

          // const valuesFn = fn.invoke as ValuesFn;
          // const valuesArgs = fn.args as ValuesArgs;
          // let [valuesToInsert] = valuesArgs;

          // if (!Array.isArray(valuesToInsert)) {
          //   valuesToInsert = [valuesToInsert];
          // }

          // const valuesToInsertWithTenant = valuesToInsert.map((value) => ({
          //   ...value,
          //   [TENANT_ID_COLUMN]: tenantId,
          // }));

          // return valuesFn(valuesToInsertWithTenant);
        },
      },
      {
        pattern: ["db.update.set", "tx.update.set"],
        action: () => {
          const setFn = fn.invoke as SetFn;
          const setArgs = fn.args as SetArgs;

          const [table] = fnPath.findLast((x) => x.name === "update")
            ?.args as UpdateArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            return setFn(...setArgs).where(policy);
          }

          return setFn(...setArgs);
        },
      },
      {
        pattern: [
          "db.update.where",
          "db.update.*.where",
          "tx.update.where",
          "tx.update.*.where",
        ],
        action: () => {
          const whereFn = fn.invoke as WhereFn;
          const whereArgs = fn.args as WhereArgs;

          const [table] = [...fnPath].reverse().find((x) => x.name === "update")
            ?.args as UpdateArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            const [whereFilter] = whereArgs as [SQLWrapper];
            return whereFn(and(policy, whereFilter));
          }

          return whereFn(...whereArgs);
        },
      },
      {
        pattern: ["db.delete", "tx.delete"],
        action: () => {
          const deleteFn = fn.invoke as DeleteFn;
          const deleteArgs = fn.args as DeleteArgs;

          const [table] = deleteArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            return deleteFn(...deleteArgs).where(policy);
          }

          return deleteFn(...deleteArgs);
        },
      },
      {
        pattern: [
          "db.delete.where",
          "db.delete.*.where",
          "tx.delete.where",
          "tx.delete.*.where",
        ],
        action: () => {
          const whereFn = fn.invoke as WhereFn;
          const whereArgs = fn.args as WhereArgs;

          const [table] = fnPath.findLast((x) => x.name === "delete")
            ?.args as DeleteArgs as [Table];

          const policy = getPolicy(table);

          if (policy) {
            const [whereOptions] = whereArgs as [SQLWrapper];
            return whereFn(and(policy, whereOptions));
          }

          return whereFn(...whereArgs);
        },
      },
      {
        pattern: "db.transaction",
        action: () => {
          const transactionFn = fn.invoke as TransactionFn;
          const transactionArgs = fn.args as TransactionArgs;

          const [callback, ...restArgs] = transactionArgs;

          const nextCallback: typeof callback = async (...args) => {
            const [tx] = args;
            const rlsTx = createInterceptProxy(tx, { path: ["tx"] });

            return callback(rlsTx);
          };

          return transactionFn(nextCallback, ...restArgs);
        },
      },
    ];

    const fnOverride = overrides.find(({ pattern, action }) => {
      if (Array.isArray(pattern) && pattern.some(matchPath)) {
        return action;
      }

      if (typeof pattern === "string" && matchPath(pattern)) {
        return action;
      }

      return null;
    })?.action;

    return fnOverride ? fnOverride() : fn.invoke(...fn.args);
  };

  const createInterceptProxy = <T extends object>(
    target: T,
    context: InvokeContext = {},
  ): T => {
    const { path = [], fnPath = [] } = context;

    return new Proxy<T>(target, {
      get: (innerTarget, innerTargetProp, innerTargetReceiver) => {
        const currentPath = path.concat(innerTargetProp.toString());
        const innerTargetPropValue = Reflect.get(
          innerTarget,
          innerTargetProp,
          innerTargetReceiver,
        );

        if (typeof innerTargetPropValue === "function") {
          return (...args: AnyArgs) => {
            const currentFnPath = [
              ...fnPath,
              { name: innerTargetProp.toString(), args },
            ];

            const result = intercept(
              {
                invoke: innerTargetPropValue.bind(
                  innerTarget,
                ) as InterceptFn["invoke"],
                name: innerTargetProp.toString(),
                args,
              },
              { path: currentPath, fnPath: currentFnPath },
            );

            if (
              typeof result === "object" &&
              result !== null &&
              !Array.isArray(result)
            ) {
              return createInterceptProxy(result, {
                path: currentPath,
                fnPath: currentFnPath,
              });
            }

            return result;
          };
        } else if (
          typeof innerTargetPropValue === "object" &&
          innerTargetPropValue !== null &&
          !Array.isArray(innerTargetPropValue)
        ) {
          // wrap nested objects in a proxy as well
          return createInterceptProxy(innerTargetPropValue, {
            path: currentPath,
            fnPath,
          });
        }

        return innerTargetPropValue;
      },
    });
  };

  return createInterceptProxy(db, { path: ["db"] });
};
