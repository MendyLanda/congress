import { eq, isNull, lt, ne, relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  char,
  check,
  date,
  index,
  pgEnum,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import {
  personContactTypes,
  personRelationshipTypes,
} from "@congress/validators/person";

import { createTable } from "../create-table";
import { timestamp, ulid } from "../types";

export const Person = createTable(
  "person",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    nationalId: varchar("national_id", { length: 10 }).notNull().unique(),
    firstName: text(),
    lastName: text(),
    gender: char({ length: 1 }),
    dateOfBirth: date({ mode: "date" }),
  },
  (table) => [check("gender_check", sql`${table.gender} IN ('M', 'F')`)],
);

export const contactTypeEnum = pgEnum("contact_type", personContactTypes);

export const PersonContact = createTable(
  "person_contact",
  {
    id: ulid("id", "personContact").primaryKey(),
    personId: bigint({ mode: "number" }).notNull(),
    value: text().notNull(),
    contactType: contactTypeEnum(),
    isPrimary: boolean().notNull().default(false),
  },
  (table) => [
    index("person_contact_person_id_index").on(table.personId),
    uniqueIndex("person_contact_person_id_value_unique").on(
      table.personId,
      table.value,
    ),
    uniqueIndex("person_contact_person_id_contact_type_unique")
      .on(table.personId, table.contactType)
      .where(eq(table.isPrimary, true).inlineParams()),
  ],
);

export const PersonAddress = createTable(
  "person_address",
  {
    id: ulid("id", "personAddress").primaryKey(),
    personId: bigint({ mode: "number" }).notNull(),
    cityId: bigint({ mode: "number" }).notNull(),
    streetId: bigint({ mode: "number" }).notNull(),
    houseNumber: text().notNull(),
    addressLine2: text(),
    postalCode: text(),
    country: char({ length: 2 }),
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date"),
  },
  (table) => [
    index("person_address_person_id_index").on(table.personId),
    check(
      "person_address_end_date_check",
      sql`${isNull(table.endDate)} OR ${lt(table.endDate, table.startDate)}`,
    ),
    uniqueIndex("person_address_person_id_unique")
      .on(table.personId)
      .where(isNull(table.endDate)),
  ],
);

export const relationshipTypeEnum = pgEnum(
  "relationship_type",
  personRelationshipTypes,
);

/**
 * Always create a relationship in one direction:
 * - Parent -> Child
 * - Guardian -> Child
 * - Spouse <-> Spouse (Husband <-> Wife)
 *
 * Siblings are implicitly created when a parent creates a relationship with multiple children.
 */
export const PersonRelationship = createTable(
  "person_relationship",
  {
    id: ulid("id", "personRelationship").primaryKey(),
    personId: bigint({ mode: "number" })
      .notNull()
      .references(() => Person.id, { onDelete: "cascade" }),
    relatedPersonId: bigint({ mode: "number" })
      .notNull()
      .references(() => Person.id, { onDelete: "cascade" }),
    relationshipType: relationshipTypeEnum().notNull(),
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date"),
    endReason: text(),
    details: text(),
  },
  (table) => [
    index("person_relationship_person_id_index").on(table.personId),
    index("person_relationship_related_person_id_index").on(
      table.relatedPersonId,
    ),
    uniqueIndex("person_relationship_person_id_related_person_id_unique")
      .on(
        sql`LEAST(${table.personId}, ${table.relatedPersonId})`,
        sql`GREATEST(${table.personId}, ${table.relatedPersonId})`,
        table.relationshipType,
      )
      .where(
        sql`${eq(table.relationshipType, "spouse").inlineParams()} AND ${isNull(table.endDate)}`,
      ),
    check(
      "person_relationship_is_different_from_related_person_check",
      ne(table.personId, table.relatedPersonId),
    ),
  ],
);

export const personContactRelations = relations(PersonContact, ({ one }) => ({
  person: one(Person, {
    fields: [PersonContact.personId],
    references: [Person.id],
  }),
}));

export const personAddressRelations = relations(PersonAddress, ({ one }) => ({
  person: one(Person, {
    fields: [PersonAddress.personId],
    references: [Person.id],
  }),
}));

export const personRelations = relations(Person, ({ many }) => ({
  contacts: many(PersonContact),
  addresses: many(PersonAddress),
  relationships: many(PersonRelationship),
}));
