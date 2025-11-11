import { normalizeHebrew } from "@congress/validators/utils";

import { db } from "../client";
import { City, Street } from "../schema/location.sql";

export interface ResourceResponse<TRecord> {
  help: string;
  success: boolean;
  result: Result<TRecord>;
}

export interface Result<TRecord> {
  include_total: boolean;
  limit: number;
  records_format: string;
  resource_id: string;
  total_estimation_threshold: null;
  records: TRecord[];
  fields: Field[];
  _links: Links;
  total: number;
  total_was_estimated: boolean;
}

export interface Links {
  start: string;
  next: string;
}

export interface Field {
  id: string;
  type: Type;
  info?: FieldInfo;
}

export interface FieldInfo {
  label: string;
  notes: string;
  type_override: string;
}

export type Type = "int" | "text" | "numeric";

export interface CityRecord {
  _id: number;
  city_code: string;
  city_name_he: string;
  city_name_en: string;
  region_code: number;
  region_name: string;
  PIBA_bureau_code: number;
  PIBA_bureau_name: string;
  Regional_Council_code: number;
  Regional_Council_name: null | string;
}

export interface StreetRecord {
  _id: number;
  city_code: number;
  city_name: string; // hebrew name
  official_code: number;
  street_code: number;
  street_name: string; // hebrew name
  street_name_status: "official" | `synonym of ${string}`;
  region_name: string;
  region_code: number;
}

const BATCH_SIZE = 500;

function trimOrNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : (trimmed as unknown as string);
}

function parseIntOrNull(value: string | null | undefined | number): number {
  if (value === null || value === undefined) {
    return null as unknown as number;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null as unknown as number;
    }
    return parseInt(trimmed, 10);
  }

  return value;
}

async function fetchAndInsertCities(): Promise<number> {
  let url =
    "https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=500";
  let totalRecords = 0;
  let totalFetched = 0;
  let totalInserted = 0;
  let batchNumber = 0;
  const batchBuffer: CityRecord[] = [];

  while (url) {
    const response = await fetch(url);
    const data = (await response.json()) as ResourceResponse<CityRecord>;

    if (data.result.records.length === 0) {
      break;
    }

    if (totalRecords === 0) {
      totalRecords = data.result.total;
      console.log(`Total cities to fetch: ${totalRecords}`);
    }

    batchBuffer.push(...data.result.records);
    totalFetched += data.result.records.length;

    // Process batches of BATCH_SIZE
    while (batchBuffer.length >= BATCH_SIZE) {
      const batch = batchBuffer.splice(0, BATCH_SIZE);
      batchNumber++;
      const transformedBatch = batch.map(transformCityRecord);

      try {
        await db
          .insert(City)
          .values(transformedBatch as never[])
          .onConflictDoNothing();
        totalInserted += batch.length;
        console.log(
          `Cities: Inserted batch ${batchNumber} (${totalInserted}/${totalFetched} fetched so far)`,
        );
      } catch (error) {
        console.error(`Error inserting cities batch ${batchNumber}:`, error);
        throw error;
      }
    }

    console.log(`Cities: Fetched ${totalFetched}/${totalRecords}...`);

    if (totalFetched >= totalRecords) {
      break;
    }

    const nextUrl = data.result._links.next;
    if (!nextUrl) {
      break;
    }

    url = `https://data.gov.il${nextUrl}`;
  }

  // Insert remaining records in buffer
  if (batchBuffer.length > 0) {
    batchNumber++;
    const transformedBatch = batchBuffer.map(transformCityRecord);
    try {
      await db
        .insert(City)
        .values(transformedBatch as never[])
        .onConflictDoNothing();
      totalInserted += batchBuffer.length;
      console.log(
        `Cities: Inserted final batch ${batchNumber} (${totalInserted} total)`,
      );
    } catch (error) {
      console.error(`Error inserting final cities batch:`, error);
      throw error;
    }
  }

  return totalInserted;
}

async function fetchAndInsertStreets(): Promise<number> {
  let url =
    "https://data.gov.il/api/3/action/datastore_search?resource_id=bf185c7f-1a4e-4662-88c5-fa118a244bda&limit=500";
  let totalRecords = 0;
  let totalFetched = 0;
  let totalInserted = 0;
  let batchNumber = 0;
  const batchBuffer: StreetRecord[] = [];

  while (url) {
    const response = await fetch(url);
    const data = (await response.json()) as ResourceResponse<StreetRecord>;

    if (data.result.records.length === 0) {
      break;
    }

    if (totalRecords === 0) {
      totalRecords = data.result.total;
      console.log(`Total streets to fetch: ${totalRecords}`);
    }

    batchBuffer.push(...data.result.records);
    totalFetched += data.result.records.length;

    // Process batches of BATCH_SIZE
    while (batchBuffer.length >= BATCH_SIZE) {
      const batch = batchBuffer.splice(0, BATCH_SIZE);
      batchNumber++;
      const transformedBatch = batch.map(transformStreetRecord);

      try {
        await db
          .insert(Street)
          .values(transformedBatch as never[])
          .onConflictDoNothing();
        totalInserted += batch.length;
        console.log(
          `Streets: Inserted batch ${batchNumber} (${totalInserted}/${totalFetched} fetched so far)`,
        );
      } catch (error) {
        console.error(`Error inserting streets batch ${batchNumber}:`, error);
        throw error;
      }
    }

    console.log(`Streets: Fetched ${totalFetched}/${totalRecords}...`);

    if (totalFetched >= totalRecords) {
      break;
    }

    const nextUrl = data.result._links.next;
    if (!nextUrl) {
      break;
    }

    url = `https://data.gov.il${nextUrl}`;
  }

  // Insert remaining records in buffer
  if (batchBuffer.length > 0) {
    batchNumber++;
    const transformedBatch = batchBuffer.map(transformStreetRecord);
    try {
      await db
        .insert(Street)
        .values(transformedBatch as never[])
        .onConflictDoNothing();
      totalInserted += batchBuffer.length;
      console.log(
        `Streets: Inserted final batch ${batchNumber} (${totalInserted} total)`,
      );
    } catch (error) {
      console.error(`Error inserting final streets batch:`, error);
      throw error;
    }
  }

  return totalInserted;
}

function transformCityRecord(record: CityRecord): typeof City.$inferInsert {
  return {
    country: "IL" as const,
    code: parseIntOrNull(record.city_code),
    nameHe: trimOrNull(record.city_name_he) as unknown as string,
    nameHeNormalized: normalizeHebrew(
      trimOrNull(record.city_name_he) as unknown as string,
    ),
    nameEn: trimOrNull(record.city_name_en),
    nameRu: null,
    pibaBureauCode: parseIntOrNull(record.PIBA_bureau_code),
    pibaBureauName: trimOrNull(record.PIBA_bureau_name),
    regionalCouncilCode: parseIntOrNull(record.Regional_Council_code),
    regionalCouncilName: trimOrNull(record.Regional_Council_name),
    regionCode: parseIntOrNull(record.region_code),
    regionName: trimOrNull(record.region_name),
  };
}

function transformStreetRecord(
  record: StreetRecord,
): typeof Street.$inferInsert {
  const code = parseIntOrNull(record.street_code);
  const officialCode = parseIntOrNull(record.official_code);

  return {
    code: parseIntOrNull(record.street_code),
    cityCode: parseIntOrNull(record.city_code),
    nameHe: trimOrNull(record.street_name) as unknown as string,
    nameHeNormalized: normalizeHebrew(
      trimOrNull(record.street_name) as unknown as string,
    ),
    synonymOf: officialCode === code ? null : officialCode,
    nameEn: null,
    nameRu: null,
  };
}

// async function queryTopCitiesByStreetCount(limit = 100) {
//   const results = await db
//     .select({
//       cityId: City.id,
//       cityEnglishName: City.englishName,
//       citySymbol: City.symbol,
//       streetCount: sql<number>`COUNT(${Street.id})`.as("street_count"),
//     })
//     .from(City)
//     .innerJoin(Street, eq(City.sourceId, Street.citySymbol))
//     .groupBy(City.id, City.englishName, City.symbol)
//     .orderBy(desc(sql<number>`COUNT(${Street.id})`))
//     .limit(limit);

//   return results;
// }

async function main() {
  console.log("Starting address seeding...");

  // Start both fetch-and-insert operations in parallel
  console.log("\nFetching and inserting cities...");
  const citiesPromise = fetchAndInsertCities().then((inserted) => {
    console.log(`✓ Inserted ${inserted} cities`);
    return inserted;
  });

  console.log("\nFetching and inserting streets...");
  const streetsPromise = fetchAndInsertStreets().then((inserted) => {
    console.log(`✓ Inserted ${inserted} streets`);
    return inserted;
  });

  // Wait for both operations to complete
  await Promise.all([citiesPromise, streetsPromise]);

  console.log("\n✓ Address seeding completed successfully!");
}

void main();
