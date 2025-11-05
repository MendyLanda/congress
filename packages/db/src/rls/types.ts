import type {
  Operators,
  Simplify,
  SQL,
  TableRelationalConfig,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Sql } from "postgres";

import type * as schema from "../schema";

export type DbSchema = typeof schema;
declare const db: PostgresJsDatabase<DbSchema> & {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $client: Sql<{}>;
};

export type DbClient = typeof db;

export type FindFn<K extends keyof typeof db.query = keyof typeof db.query> = (
  ...args:
    | Parameters<(typeof db.query)[K]["findFirst"]>
    | Parameters<(typeof db.query)[K]["findMany"]>
) =>
  | ReturnType<(typeof db.query)[K]["findFirst"]>
  | ReturnType<(typeof db.query)[K]["findMany"]>;

export type FindArgs<K extends keyof typeof db.query = keyof typeof db.query> =
  Parameters<FindFn<K>>;

export type TransactionFn = typeof db.transaction;

export type TransactionArgs = Parameters<TransactionFn>;

type SelectFn = typeof db.select;

export type FromFn = ReturnType<SelectFn>["from"];

export type FromArgs = Parameters<FromFn>;

export type WhereFn = ReturnType<FromFn>["where"];

export type WhereArgs = Parameters<WhereFn>;

export type JoinFn = ReturnType<FromFn>["leftJoin"];

export type JoinArgs = Parameters<JoinFn>;

type InsertFn = typeof db.insert;

export type ValuesFn = ReturnType<InsertFn>["values"];

export type ValuesArgs = Parameters<ValuesFn>;

type UpdateFn = typeof db.update;

export type UpdateArgs = Parameters<UpdateFn>;

export type SetFn = ReturnType<UpdateFn>["set"];

export type SetArgs = Parameters<SetFn>;

export type DeleteFn = typeof db.delete;

export type DeleteArgs = Parameters<DeleteFn>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArgs = any[];

export type QueryWhereFn = (
  fields: Simplify<
    [TableRelationalConfig["columns"]] extends [never]
      ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {}
      : TableRelationalConfig["columns"]
  >,
  operators: Operators,
) => SQL | undefined;

export type QueryWhereFnArgs = Parameters<QueryWhereFn>;

export type QueryWhereConfig = SQL | undefined | QueryWhereFn;
