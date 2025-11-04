import type { Config } from "drizzle-kit";

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

type RequiredObject<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined>;
};

export default {
  dialect: "postgresql",
  schema: "src/schema/index.ts",
  dbCredentials: {
    ...(credentials as RequiredObject<typeof credentials>),
    ssl: "require",
  },
  casing: "snake_case",
} satisfies Config;
