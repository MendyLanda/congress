import z from "zod";

function luhnCheck(num: string): boolean {
  const str = String(num).replace(/\s+/g, ""); // remove spaces
  if (!/^\d+$/.test(str)) return false; // must be digits only

  let sum = 0;
  let shouldDouble = false;

  // iterate from right to left
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = str.charCodeAt(i) - 48; // faster than parseInt(str[i], 10)

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9; // equivalent to summing digits
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export const zodIsraeliId = z.string().refine(luhnCheck, "Invalid Israeli ID");

export const validateIsraeliId = (id: string): boolean => {
  return luhnCheck(id);
};
