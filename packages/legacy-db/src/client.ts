import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const credentials = {
  database: process.env.LEGACY_DB_DATABASE,
  host: process.env.LEGACY_DB_HOST,
  user: process.env.LEGACY_DB_USERNAME,
  password: process.env.LEGACY_DB_PASSWORD,
};

if (
  !credentials.database ||
  !credentials.host ||
  !credentials.user ||
  !credentials.password
) {
  throw new Error("Missing legacy database credentials");
}

const client = postgres({
  prepare: false,
  ...credentials,
});

export const legacyDb = drizzle({
  client,
  schema,
  casing: "snake_case",
});
