import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  pgEnum,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { createTable } from "../create-table";
import { ulid } from "../types";
import { Application } from "./application.sql";
import { User } from "./dashboard-auth.sql";
import { Person } from "./person.sql";
import { ProgramDocumentRequirement } from "./program-requirements.sql";
import { Upload } from "./upload.sql";

/**
 * document_type table - Predefined and custom document types
 * System-defined types are created during migration
 * Staff can create custom types as needed
 */
export const DocumentType = createTable(
  "document_type",
  {
    id: ulid("id", "documentType").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isSystemDefined: boolean("is_system_defined").notNull().default(false), // cannot be deleted if true
    createdByUserId: ulid("created_by_user_id", "user").references(
      () => User.id,
      {
        onDelete: "set null",
      },
    ),
    maxAllowedFiles: integer("max_allowed_files").notNull().default(1),
    allowedFileTypes: text("allowed_file_types").array().notNull(),
    maxFileSize: bigint({ mode: "number" }).notNull().default(5242880), // 10MB
  },
  (table) => [index("document_type_name_index").on(table.name)],
);

export const documentTypeRelations = relations(
  DocumentType,
  ({ one, many }) => ({
    createdBy: one(User, {
      fields: [DocumentType.createdByUserId],
      references: [User.id],
    }),
    programRequirements: many(ProgramDocumentRequirement),
  }),
);

/**
 * Application document status enum
 */
export const personDocumentStatusEnum = pgEnum("person_document_status", [
  "pending",
  "approved",
  "rejected",
]);

export const PersonDocument = createTable(
  "person_document",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    personId: bigint({ mode: "number" })
      .references(() => Person.id, {
        onDelete: "cascade",
      })
      .notNull(),
    documentTypeId: ulid("document_type_id", "documentType")
      .notNull()
      .references(() => DocumentType.id, {
        onDelete: "cascade",
      }),
    uploadId: ulid("upload_id", "upload")
      .notNull()
      .references(() => Upload.id, {
        onDelete: "cascade",
      }),

    /**
     * Links uploaded documents to an application.
     * useful for showing documents uploaded for an application.
     */
    applicationId: ulid("application_id", "application").references(
      () => Application.id,
      { onDelete: "cascade" },
    ),
    status: personDocumentStatusEnum("status").notNull().default("pending"),
    reviewedByUserId: ulid("reviewed_by_user_id", "user").references(
      () => User.id,
      {
        onDelete: "set null",
      },
    ),
    /**
     * How confident the system is that the document is valid.
     */
    systemConfidenceScore: smallint("system_confidence_score"),
    systemConfidenceExplanation: text("system_confidence_explanation"),
    timeReviewed: timestamp("time_reviewed"),
    rejectionReason: text("rejection_reason"),
  },
  (table) => [
    index("person_document_person_id_index").on(table.personId),
    index("person_document_document_type_id_index").on(table.documentTypeId),
    index("person_document_upload_id_index").on(table.uploadId),
    index("person_document_application_id_index").on(table.applicationId),
    index("person_document_status_index").on(table.status),
  ],
);

export const personDocumentRelations = relations(PersonDocument, ({ one }) => ({
  person: one(Person, {
    fields: [PersonDocument.personId],
    references: [Person.id],
  }),
  documentType: one(DocumentType, {
    fields: [PersonDocument.documentTypeId],
    references: [DocumentType.id],
  }),
  upload: one(Upload, {
    fields: [PersonDocument.uploadId],
    references: [Upload.id],
  }),
  application: one(Application, {
    fields: [PersonDocument.applicationId],
    references: [Application.id],
  }),
  reviewedBy: one(User, {
    fields: [PersonDocument.reviewedByUserId],
    references: [User.id],
  }),
}));
