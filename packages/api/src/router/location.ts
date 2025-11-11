import type { TRPCRouterRecord } from "@trpc/server";

import { and, desc, eq, sql, trgm } from "@congress/db";
import { db } from "@congress/db/client";
import { City, Street } from "@congress/db/schema";
import {
  citySearchSchema,
  streetSearchSchema,
} from "@congress/validators/location";
import { normalizeHebrew } from "@congress/validators/utils";

import { publicProcedure } from "../trpc";

export const locationRouter = {
  cities: publicProcedure({ captcha: false })
    .input(citySearchSchema)
    .query(async ({ input }) => {
      const hasSearch = !!input.search?.trim();

      const data = await db.query.City.findMany({
        columns: {
          id: true,
          nameHe: true,
        },
        where: trgm(
          City.nameHeNormalized,
          normalizeHebrew(input.search ?? ""),
        ).if(hasSearch),
        orderBy: [
          hasSearch
            ? desc(
                sql`similarity(${City.nameHeNormalized}, ${normalizeHebrew(input.search ?? "")})`,
              )
            : desc(City.nameHeNormalized),
        ],
        limit: 10,
      });

      return data;
    }),
  streets: publicProcedure({ captcha: false })
    .input(streetSearchSchema)
    .query(async ({ input }) => {
      const hasSearch = !!input.search?.trim();

      const data = await db.query.Street.findMany({
        columns: {
          id: true,
          nameHe: true,
        },
        where: and(
          eq(Street.cityCode, input.cityCode),
          trgm(Street.nameHeNormalized, normalizeHebrew(input.search ?? "")).if(
            hasSearch,
          ),
        ),
        orderBy: [
          hasSearch
            ? desc(
                sql`similarity(${Street.nameHeNormalized}, ${normalizeHebrew(input.search ?? "")})`,
              )
            : desc(Street.nameHeNormalized),
        ],
        limit: 10,
      });

      return data;
    }),
} satisfies TRPCRouterRecord;
