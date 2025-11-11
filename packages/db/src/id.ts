import { ulid } from "ulidx";

export const prefixes = {
  user: "user",
  session: "ses",
  account: "acc",
  verification: "ver",
  person: "person",
  personContact: "p_ctct",
  personAddress: "p_addr",
  personRelationship: "p_rel",
  beneficiaryAccount: "ben_acc",
  beneficiarySession: "ben_ses",
  beneficiaryDocument: "ben_dcm",
  upload: "upl",
  documentType: "dcm_type",
} as const;

function _createFixedId<
  TPrefix extends keyof typeof prefixes,
  TID extends string,
>(prefix: TPrefix, id: TID) {
  return [prefixes[prefix], id].join(
    "_",
  ) as `${(typeof prefixes)[TPrefix]}_${TID}`;
}

export const SYSTEM_DOCUMENT_IDS = {
  idCard: _createFixedId("documentType", "id_card"),
  idAppendix: _createFixedId("documentType", "id_appendix"),
} as const;
export const SYSTEM_USER_ID = _createFixedId("user", "system");

const _typeCheckUniquePrefixes: ErrorIfDuplicates<typeof prefixes> = prefixes;

function createID(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], ulid()].join("_");
}

createID.prefixes = prefixes;
createID.SYSTEM_DOCUMENT_IDS = SYSTEM_DOCUMENT_IDS;
createID.SYSTEM_USER_ID = SYSTEM_USER_ID;

type Duplicate<T extends Record<string, string>> = {
  [K in keyof T]: {
    [L in keyof T]: T[K] extends T[L] ? (K extends L ? never : K) : never;
  }[keyof T];
}[keyof T];

type HasDuplicates<T extends Record<string, string>> =
  Duplicate<T> extends never ? false : true;

type ErrorIfDuplicates<T extends Record<string, string>> =
  HasDuplicates<T> extends true
    ? { error: `Duplicate values found: ${Duplicate<T> & string}` }
    : T;

export { createID };
