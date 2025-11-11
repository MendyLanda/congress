import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  char,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "../create-table";

export const City = createTable(
  "city",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    country: char({ length: 2 }).notNull(),
    code: bigint({ mode: "number" }).notNull(),
    nameHe: varchar({ length: 255 }).notNull(),
    nameHeNormalized: varchar({ length: 255 }).notNull(),
    nameEn: varchar({ length: 255 }),
    nameRu: varchar({ length: 255 }),
    regionCode: bigint({ mode: "number" }).notNull(),
    regionName: varchar({ length: 255 }),
    pibaBureauCode: bigint({ mode: "number" }).notNull(),
    pibaBureauName: varchar({ length: 255 }),
    regionalCouncilCode: bigint({ mode: "number" }).notNull(),
    regionalCouncilName: varchar({ length: 255 }),
  },
  (table) => [
    uniqueIndex("city_code_country_unique").on(table.code, table.country),
    index("city_name_search_hebrew_index")
      .using("gin", sql`${table.nameHeNormalized} gin_trgm_ops`)
      .concurrently(),
  ],
);

export const Street = createTable(
  "street",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    cityCode: bigint({ mode: "number" }).notNull(),
    synonymOf: bigint({ mode: "number" }),
    code: bigint({ mode: "number" }).notNull(),
    nameHe: varchar({ length: 255 }).notNull(),
    nameHeNormalized: varchar({ length: 255 }).notNull(),
    nameEn: varchar({ length: 255 }),
    nameRu: varchar({ length: 255 }),
  },
  (table) => [
    index("street_city_code_index").on(table.cityCode),
    uniqueIndex("street_code_city_code_unique").on(table.code, table.cityCode),
    index("street_name_search_hebrew_index")
      .using("gin", sql`${table.nameHeNormalized} gin_trgm_ops`)
      .concurrently(),
  ],
);
