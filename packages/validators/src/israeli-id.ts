import { z } from "zod/v4";

const DIGIT_ONLY_REGEX = /^\d+$/;
const RAW_ID_REGEX = /^\d{5,9}$/;
const ISRAELI_ID_LENGTH = 9;

function normalizeIsraeliId(id: string): string | null {
  const digitsOnly = id.replace(/\s+/g, "");
  if (!RAW_ID_REGEX.test(digitsOnly)) {
    return null;
  }

  return digitsOnly.padStart(ISRAELI_ID_LENGTH, "0");
}

function luhnCheck(normalizedId: string): boolean {
  if (!DIGIT_ONLY_REGEX.test(normalizedId)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = normalizedId.length - 1; i >= 0; i--) {
    let digit = normalizedId.charCodeAt(i) - 48;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export const zodIsraeliId = z
  .string()
  .trim()
  .refine(
    (value) => {
      const normalized = normalizeIsraeliId(value);
      return normalized !== null && luhnCheck(normalized);
    },
    {
      message: "national_id_incorrect",
    },
  )
  .transform((value) => normalizeIsraeliId(value) ?? value);

export const validateIsraeliId = (id: string): boolean => {
  const normalized = normalizeIsraeliId(id);
  return normalized !== null && luhnCheck(normalized);
};

export const normalizeIsraeliIdForStorage = (id: string): string | null => {
  const normalized = normalizeIsraeliId(id);
  if (!normalized || !luhnCheck(normalized)) {
    return null;
  }

  return normalized;
};
