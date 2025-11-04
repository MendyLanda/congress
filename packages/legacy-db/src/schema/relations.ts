import { relations } from "drizzle-orm/relations";

import {
  committeePersonObjects,
  coordinatorObjects,
  couponCardObjects,
  documentObjects,
  needyObjects,
  organizationObjects,
  paymentObjects,
  projectObjects,
  rhCoordinatorObjects,
  rhCouponCardObjects,
  rhDocumentObjects,
  rhNeedyObjects,
  rhOrganizationObjects,
  rhPaymentObjects,
  rhStudentObjects,
  rhSupportRecommendationObjects,
  rhUserObjects,
  sDocumentObject2023S,
  sDocumentObject2024S,
  sDocumentObject2025S,
  sDocumentObjects,
  sOfficeNoteObject2023S,
  sOfficeNoteObject2024S,
  sOfficeNoteObject2025S,
  sOfficeNoteObjects,
  sPaymentObject2023S,
  sPaymentObject2024S,
  sPaymentObject2025S,
  sPaymentObjects,
  sStudentObject2023S,
  sStudentObject2024S,
  sStudentObject2025S,
  sStudentObjects,
  sSupportObject2023S,
  sSupportObject2024S,
  sSupportObject2025S,
  sSupportObjects,
  studentChildObjects,
  studentObjects,
  supportRecommendationObjects,
  sUserObject2023S,
  sUserObject2024S,
  sUserObject2025S,
  sUserObjects,
  userObjects,
  walDocumentObjects,
  walOfficeNoteObjects,
  walPaymentObjects,
  walPersonObjects,
  walRequestObjects,
  walSupportObjects,
  walUserObjects,
} from "./schema";

export const sDocumentObject2025SRelations = relations(
  sDocumentObject2025S,
  ({ one, many }) => ({
    sStudentObject2025: one(sStudentObject2025S, {
      fields: [sDocumentObject2025S.studentId],
      references: [sStudentObject2025S.id],
    }),
    sPaymentObject2025S: many(sPaymentObject2025S),
  }),
);

export const sStudentObject2025SRelations = relations(
  sStudentObject2025S,
  ({ many }) => ({
    sDocumentObject2025S: many(sDocumentObject2025S),
    sPaymentObject2025S: many(sPaymentObject2025S),
    sSupportObject2025S: many(sSupportObject2025S),
    sOfficeNoteObject2025S: many(sOfficeNoteObject2025S),
  }),
);

export const sPaymentObject2025SRelations = relations(
  sPaymentObject2025S,
  ({ one }) => ({
    sDocumentObject2025: one(sDocumentObject2025S, {
      fields: [sPaymentObject2025S.receiverSignatureDocId],
      references: [sDocumentObject2025S.id],
    }),
    sStudentObject2025: one(sStudentObject2025S, {
      fields: [sPaymentObject2025S.studentId],
      references: [sStudentObject2025S.id],
    }),
    sUserObject2025: one(sUserObject2025S, {
      fields: [sPaymentObject2025S.userEnterId],
      references: [sUserObject2025S.id],
    }),
  }),
);

export const sUserObject2025SRelations = relations(
  sUserObject2025S,
  ({ many }) => ({
    sPaymentObject2025S: many(sPaymentObject2025S),
    sSupportObject2025S: many(sSupportObject2025S),
    sOfficeNoteObject2025S: many(sOfficeNoteObject2025S),
  }),
);

export const sSupportObject2025SRelations = relations(
  sSupportObject2025S,
  ({ one }) => ({
    sStudentObject2025: one(sStudentObject2025S, {
      fields: [sSupportObject2025S.studentId],
      references: [sStudentObject2025S.id],
    }),
    sUserObject2025: one(sUserObject2025S, {
      fields: [sSupportObject2025S.recommenderId],
      references: [sUserObject2025S.id],
    }),
  }),
);

export const sOfficeNoteObject2025SRelations = relations(
  sOfficeNoteObject2025S,
  ({ one }) => ({
    sStudentObject2025: one(sStudentObject2025S, {
      fields: [sOfficeNoteObject2025S.studentId],
      references: [sStudentObject2025S.id],
    }),
    sUserObject2025: one(sUserObject2025S, {
      fields: [sOfficeNoteObject2025S.userEnterId],
      references: [sUserObject2025S.id],
    }),
  }),
);

export const couponCardObjectsRelations = relations(
  couponCardObjects,
  ({ one }) => ({
    paymentObject: one(paymentObjects, {
      fields: [couponCardObjects.paymentId],
      references: [paymentObjects.id],
    }),
    projectObject: one(projectObjects, {
      fields: [couponCardObjects.projectId],
      references: [projectObjects.id],
    }),
  }),
);

export const paymentObjectsRelations = relations(
  paymentObjects,
  ({ one, many }) => ({
    couponCardObjects: many(couponCardObjects),
    projectObject: one(projectObjects, {
      fields: [paymentObjects.projectId],
      references: [projectObjects.id],
    }),
    needyObject: one(needyObjects, {
      fields: [paymentObjects.needyId],
      references: [needyObjects.id],
    }),
    documentObject: one(documentObjects, {
      fields: [paymentObjects.receiverSignatureDocId],
      references: [documentObjects.id],
    }),
    userObject: one(userObjects, {
      fields: [paymentObjects.userEnterId],
      references: [userObjects.id],
    }),
  }),
);

export const projectObjectsRelations = relations(
  projectObjects,
  ({ many }) => ({
    couponCardObjects: many(couponCardObjects),
    documentObjects: many(documentObjects),
    coordinatorObjects: many(coordinatorObjects),
    committeePersonObjects: many(committeePersonObjects),
    paymentObjects: many(paymentObjects),
    needyObjects: many(needyObjects),
    organizationObjects: many(organizationObjects),
    studentChildObjects: many(studentChildObjects),
    supportRecommendationObjects: many(supportRecommendationObjects),
    studentObjects: many(studentObjects),
    userObjects: many(userObjects),
  }),
);

export const documentObjectsRelations = relations(
  documentObjects,
  ({ one, many }) => ({
    needyObject: one(needyObjects, {
      fields: [documentObjects.needyId],
      references: [needyObjects.id],
    }),
    projectObject: one(projectObjects, {
      fields: [documentObjects.projectId],
      references: [projectObjects.id],
    }),
    paymentObjects: many(paymentObjects),
  }),
);

export const needyObjectsRelations = relations(
  needyObjects,
  ({ one, many }) => ({
    documentObjects: many(documentObjects),
    paymentObjects: many(paymentObjects),
    projectObject: one(projectObjects, {
      fields: [needyObjects.projectId],
      references: [projectObjects.id],
    }),
    userObject: one(userObjects, {
      fields: [needyObjects.creatorId],
      references: [userObjects.id],
    }),
    organizationObject: one(organizationObjects, {
      fields: [needyObjects.organizationId],
      references: [organizationObjects.id],
    }),
    supportRecommendationObjects: many(supportRecommendationObjects),
    studentObjects: many(studentObjects),
  }),
);

export const coordinatorObjectsRelations = relations(
  coordinatorObjects,
  ({ one, many }) => ({
    organizationObject: one(organizationObjects, {
      fields: [coordinatorObjects.organizationId],
      references: [organizationObjects.id],
    }),
    userObject: one(userObjects, {
      fields: [coordinatorObjects.userId],
      references: [userObjects.id],
    }),
    projectObject: one(projectObjects, {
      fields: [coordinatorObjects.projectId],
      references: [projectObjects.id],
    }),
    committeePersonObjects: many(committeePersonObjects),
  }),
);

export const organizationObjectsRelations = relations(
  organizationObjects,
  ({ one, many }) => ({
    coordinatorObjects: many(coordinatorObjects),
    needyObjects: many(needyObjects),
    projectObject: one(projectObjects, {
      fields: [organizationObjects.projectId],
      references: [projectObjects.id],
    }),
  }),
);

export const userObjectsRelations = relations(userObjects, ({ one, many }) => ({
  coordinatorObjects: many(coordinatorObjects),
  paymentObjects: many(paymentObjects),
  needyObjects: many(needyObjects),
  supportRecommendationObjects: many(supportRecommendationObjects),
  projectObject: one(projectObjects, {
    fields: [userObjects.projectId],
    references: [projectObjects.id],
  }),
}));

export const committeePersonObjectsRelations = relations(
  committeePersonObjects,
  ({ one }) => ({
    coordinatorObject: one(coordinatorObjects, {
      fields: [committeePersonObjects.coordinatorId],
      references: [coordinatorObjects.id],
    }),
    projectObject: one(projectObjects, {
      fields: [committeePersonObjects.projectId],
      references: [projectObjects.id],
    }),
  }),
);

export const rhPaymentObjectsRelations = relations(
  rhPaymentObjects,
  ({ one, many }) => ({
    rhNeedyObject: one(rhNeedyObjects, {
      fields: [rhPaymentObjects.needyId],
      references: [rhNeedyObjects.id],
    }),
    rhDocumentObject: one(rhDocumentObjects, {
      fields: [rhPaymentObjects.receiverSignatureDocId],
      references: [rhDocumentObjects.id],
    }),
    rhUserObject: one(rhUserObjects, {
      fields: [rhPaymentObjects.userEnterId],
      references: [rhUserObjects.id],
    }),
    rhCouponCardObjects: many(rhCouponCardObjects),
  }),
);

export const rhNeedyObjectsRelations = relations(
  rhNeedyObjects,
  ({ one, many }) => ({
    rhPaymentObjects: many(rhPaymentObjects),
    rhUserObject: one(rhUserObjects, {
      fields: [rhNeedyObjects.creatorId],
      references: [rhUserObjects.id],
    }),
    rhOrganizationObject: one(rhOrganizationObjects, {
      fields: [rhNeedyObjects.organizationId],
      references: [rhOrganizationObjects.id],
    }),
    rhStudentObjects: many(rhStudentObjects),
    rhSupportRecommendationObjects: many(rhSupportRecommendationObjects),
    rhDocumentObjects: many(rhDocumentObjects),
  }),
);

export const rhDocumentObjectsRelations = relations(
  rhDocumentObjects,
  ({ one, many }) => ({
    rhPaymentObjects: many(rhPaymentObjects),
    rhNeedyObject: one(rhNeedyObjects, {
      fields: [rhDocumentObjects.needyId],
      references: [rhNeedyObjects.id],
    }),
  }),
);

export const rhUserObjectsRelations = relations(rhUserObjects, ({ many }) => ({
  rhPaymentObjects: many(rhPaymentObjects),
  rhNeedyObjects: many(rhNeedyObjects),
  rhSupportRecommendationObjects: many(rhSupportRecommendationObjects),
  rhCoordinatorObjects: many(rhCoordinatorObjects),
}));

export const rhCouponCardObjectsRelations = relations(
  rhCouponCardObjects,
  ({ one }) => ({
    rhPaymentObject: one(rhPaymentObjects, {
      fields: [rhCouponCardObjects.paymentId],
      references: [rhPaymentObjects.id],
    }),
  }),
);

export const rhOrganizationObjectsRelations = relations(
  rhOrganizationObjects,
  ({ many }) => ({
    rhNeedyObjects: many(rhNeedyObjects),
    rhCoordinatorObjects: many(rhCoordinatorObjects),
  }),
);

export const rhStudentObjectsRelations = relations(
  rhStudentObjects,
  ({ one }) => ({
    rhNeedyObject: one(rhNeedyObjects, {
      fields: [rhStudentObjects.needyId],
      references: [rhNeedyObjects.id],
    }),
  }),
);

export const rhSupportRecommendationObjectsRelations = relations(
  rhSupportRecommendationObjects,
  ({ one }) => ({
    rhNeedyObject: one(rhNeedyObjects, {
      fields: [rhSupportRecommendationObjects.needyId],
      references: [rhNeedyObjects.id],
    }),
    rhUserObject: one(rhUserObjects, {
      fields: [rhSupportRecommendationObjects.recommenderId],
      references: [rhUserObjects.id],
    }),
  }),
);

export const rhCoordinatorObjectsRelations = relations(
  rhCoordinatorObjects,
  ({ one }) => ({
    rhOrganizationObject: one(rhOrganizationObjects, {
      fields: [rhCoordinatorObjects.organizationId],
      references: [rhOrganizationObjects.id],
    }),
    rhUserObject: one(rhUserObjects, {
      fields: [rhCoordinatorObjects.userId],
      references: [rhUserObjects.id],
    }),
  }),
);

export const sOfficeNoteObject2024SRelations = relations(
  sOfficeNoteObject2024S,
  ({ one }) => ({
    sStudentObject2024: one(sStudentObject2024S, {
      fields: [sOfficeNoteObject2024S.studentId],
      references: [sStudentObject2024S.id],
    }),
    sUserObject2024: one(sUserObject2024S, {
      fields: [sOfficeNoteObject2024S.userEnterId],
      references: [sUserObject2024S.id],
    }),
  }),
);

export const sStudentObject2024SRelations = relations(
  sStudentObject2024S,
  ({ many }) => ({
    sOfficeNoteObject2024S: many(sOfficeNoteObject2024S),
    sPaymentObject2024S: many(sPaymentObject2024S),
    sDocumentObject2024S: many(sDocumentObject2024S),
    sSupportObject2024S: many(sSupportObject2024S),
  }),
);

export const sUserObject2024SRelations = relations(
  sUserObject2024S,
  ({ many }) => ({
    sOfficeNoteObject2024S: many(sOfficeNoteObject2024S),
    sPaymentObject2024S: many(sPaymentObject2024S),
    sSupportObject2024S: many(sSupportObject2024S),
  }),
);

export const sDocumentObjectsRelations = relations(
  sDocumentObjects,
  ({ one, many }) => ({
    sStudentObject: one(sStudentObjects, {
      fields: [sDocumentObjects.studentId],
      references: [sStudentObjects.id],
    }),
    sPaymentObjects: many(sPaymentObjects),
  }),
);

export const sStudentObjectsRelations = relations(
  sStudentObjects,
  ({ many }) => ({
    sDocumentObjects: many(sDocumentObjects),
    sOfficeNoteObjects: many(sOfficeNoteObjects),
    sPaymentObjects: many(sPaymentObjects),
    sSupportObjects: many(sSupportObjects),
  }),
);

export const sOfficeNoteObjectsRelations = relations(
  sOfficeNoteObjects,
  ({ one }) => ({
    sStudentObject: one(sStudentObjects, {
      fields: [sOfficeNoteObjects.studentId],
      references: [sStudentObjects.id],
    }),
    sUserObject: one(sUserObjects, {
      fields: [sOfficeNoteObjects.userEnterId],
      references: [sUserObjects.id],
    }),
  }),
);

export const sUserObjectsRelations = relations(sUserObjects, ({ many }) => ({
  sOfficeNoteObjects: many(sOfficeNoteObjects),
  sPaymentObjects: many(sPaymentObjects),
  sSupportObjects: many(sSupportObjects),
}));

export const sOfficeNoteObject2023SRelations = relations(
  sOfficeNoteObject2023S,
  ({ one }) => ({
    sStudentObject2023: one(sStudentObject2023S, {
      fields: [sOfficeNoteObject2023S.studentId],
      references: [sStudentObject2023S.id],
    }),
    sUserObject2023: one(sUserObject2023S, {
      fields: [sOfficeNoteObject2023S.userEnterId],
      references: [sUserObject2023S.id],
    }),
  }),
);

export const sStudentObject2023SRelations = relations(
  sStudentObject2023S,
  ({ many }) => ({
    sOfficeNoteObject2023S: many(sOfficeNoteObject2023S),
    sPaymentObject2023S: many(sPaymentObject2023S),
    sDocumentObject2023S: many(sDocumentObject2023S),
    sSupportObject2023S: many(sSupportObject2023S),
  }),
);

export const sUserObject2023SRelations = relations(
  sUserObject2023S,
  ({ many }) => ({
    sOfficeNoteObject2023S: many(sOfficeNoteObject2023S),
    sPaymentObject2023S: many(sPaymentObject2023S),
    sSupportObject2023S: many(sSupportObject2023S),
  }),
);

export const sPaymentObject2023SRelations = relations(
  sPaymentObject2023S,
  ({ one }) => ({
    sDocumentObject2023: one(sDocumentObject2023S, {
      fields: [sPaymentObject2023S.receiverSignatureDocId],
      references: [sDocumentObject2023S.id],
    }),
    sStudentObject2023: one(sStudentObject2023S, {
      fields: [sPaymentObject2023S.studentId],
      references: [sStudentObject2023S.id],
    }),
    sUserObject2023: one(sUserObject2023S, {
      fields: [sPaymentObject2023S.userEnterId],
      references: [sUserObject2023S.id],
    }),
  }),
);

export const sDocumentObject2023SRelations = relations(
  sDocumentObject2023S,
  ({ one, many }) => ({
    sPaymentObject2023S: many(sPaymentObject2023S),
    sStudentObject2023: one(sStudentObject2023S, {
      fields: [sDocumentObject2023S.studentId],
      references: [sStudentObject2023S.id],
    }),
  }),
);

export const sPaymentObject2024SRelations = relations(
  sPaymentObject2024S,
  ({ one }) => ({
    sDocumentObject2024: one(sDocumentObject2024S, {
      fields: [sPaymentObject2024S.receiverSignatureDocId],
      references: [sDocumentObject2024S.id],
    }),
    sStudentObject2024: one(sStudentObject2024S, {
      fields: [sPaymentObject2024S.studentId],
      references: [sStudentObject2024S.id],
    }),
    sUserObject2024: one(sUserObject2024S, {
      fields: [sPaymentObject2024S.userEnterId],
      references: [sUserObject2024S.id],
    }),
  }),
);

export const sDocumentObject2024SRelations = relations(
  sDocumentObject2024S,
  ({ one, many }) => ({
    sPaymentObject2024S: many(sPaymentObject2024S),
    sStudentObject2024: one(sStudentObject2024S, {
      fields: [sDocumentObject2024S.studentId],
      references: [sStudentObject2024S.id],
    }),
  }),
);

export const sPaymentObjectsRelations = relations(
  sPaymentObjects,
  ({ one }) => ({
    sDocumentObject: one(sDocumentObjects, {
      fields: [sPaymentObjects.receiverSignatureDocId],
      references: [sDocumentObjects.id],
    }),
    sStudentObject: one(sStudentObjects, {
      fields: [sPaymentObjects.studentId],
      references: [sStudentObjects.id],
    }),
    sUserObject: one(sUserObjects, {
      fields: [sPaymentObjects.userEnterId],
      references: [sUserObjects.id],
    }),
  }),
);

export const walDocumentObjectsRelations = relations(
  walDocumentObjects,
  ({ one, many }) => ({
    walRequestObject: one(walRequestObjects, {
      fields: [walDocumentObjects.requestId],
      references: [walRequestObjects.id],
    }),
    walPaymentObjects: many(walPaymentObjects),
  }),
);

export const walRequestObjectsRelations = relations(
  walRequestObjects,
  ({ many }) => ({
    walDocumentObjects: many(walDocumentObjects),
    walOfficeNoteObjects: many(walOfficeNoteObjects),
    walPersonObjects: many(walPersonObjects),
    walPaymentObjects: many(walPaymentObjects),
    walSupportObjects: many(walSupportObjects),
  }),
);

export const sSupportObject2024SRelations = relations(
  sSupportObject2024S,
  ({ one }) => ({
    sUserObject2024: one(sUserObject2024S, {
      fields: [sSupportObject2024S.recommenderId],
      references: [sUserObject2024S.id],
    }),
    sStudentObject2024: one(sStudentObject2024S, {
      fields: [sSupportObject2024S.studentId],
      references: [sStudentObject2024S.id],
    }),
  }),
);

export const sSupportObjectsRelations = relations(
  sSupportObjects,
  ({ one }) => ({
    sUserObject: one(sUserObjects, {
      fields: [sSupportObjects.recommenderId],
      references: [sUserObjects.id],
    }),
    sStudentObject: one(sStudentObjects, {
      fields: [sSupportObjects.studentId],
      references: [sStudentObjects.id],
    }),
  }),
);

export const studentChildObjectsRelations = relations(
  studentChildObjects,
  ({ one }) => ({
    projectObject: one(projectObjects, {
      fields: [studentChildObjects.projectId],
      references: [projectObjects.id],
    }),
    studentObject: one(studentObjects, {
      fields: [studentChildObjects.studentId],
      references: [studentObjects.id],
    }),
  }),
);

export const studentObjectsRelations = relations(
  studentObjects,
  ({ one, many }) => ({
    studentChildObjects: many(studentChildObjects),
    projectObject: one(projectObjects, {
      fields: [studentObjects.projectId],
      references: [projectObjects.id],
    }),
    needyObject: one(needyObjects, {
      fields: [studentObjects.needyId],
      references: [needyObjects.id],
    }),
  }),
);

export const sSupportObject2023SRelations = relations(
  sSupportObject2023S,
  ({ one }) => ({
    sUserObject2023: one(sUserObject2023S, {
      fields: [sSupportObject2023S.recommenderId],
      references: [sUserObject2023S.id],
    }),
    sStudentObject2023: one(sStudentObject2023S, {
      fields: [sSupportObject2023S.studentId],
      references: [sStudentObject2023S.id],
    }),
  }),
);

export const supportRecommendationObjectsRelations = relations(
  supportRecommendationObjects,
  ({ one }) => ({
    projectObject: one(projectObjects, {
      fields: [supportRecommendationObjects.projectId],
      references: [projectObjects.id],
    }),
    needyObject: one(needyObjects, {
      fields: [supportRecommendationObjects.needyId],
      references: [needyObjects.id],
    }),
    userObject: one(userObjects, {
      fields: [supportRecommendationObjects.recommenderId],
      references: [userObjects.id],
    }),
  }),
);

export const walOfficeNoteObjectsRelations = relations(
  walOfficeNoteObjects,
  ({ one }) => ({
    walRequestObject: one(walRequestObjects, {
      fields: [walOfficeNoteObjects.requestId],
      references: [walRequestObjects.id],
    }),
    walUserObject: one(walUserObjects, {
      fields: [walOfficeNoteObjects.userEnterId],
      references: [walUserObjects.id],
    }),
  }),
);

export const walUserObjectsRelations = relations(
  walUserObjects,
  ({ many }) => ({
    walOfficeNoteObjects: many(walOfficeNoteObjects),
    walPaymentObjects: many(walPaymentObjects),
    walSupportObjects: many(walSupportObjects),
  }),
);

export const walPersonObjectsRelations = relations(
  walPersonObjects,
  ({ one }) => ({
    walRequestObject: one(walRequestObjects, {
      fields: [walPersonObjects.requestId],
      references: [walRequestObjects.id],
    }),
  }),
);

export const walPaymentObjectsRelations = relations(
  walPaymentObjects,
  ({ one }) => ({
    walDocumentObject: one(walDocumentObjects, {
      fields: [walPaymentObjects.receiverSignatureDocId],
      references: [walDocumentObjects.id],
    }),
    walRequestObject: one(walRequestObjects, {
      fields: [walPaymentObjects.requestId],
      references: [walRequestObjects.id],
    }),
    walUserObject: one(walUserObjects, {
      fields: [walPaymentObjects.userEnterId],
      references: [walUserObjects.id],
    }),
  }),
);

export const walSupportObjectsRelations = relations(
  walSupportObjects,
  ({ one }) => ({
    walUserObject: one(walUserObjects, {
      fields: [walSupportObjects.recommenderId],
      references: [walUserObjects.id],
    }),
    walRequestObject: one(walRequestObjects, {
      fields: [walSupportObjects.requestId],
      references: [walRequestObjects.id],
    }),
  }),
);
