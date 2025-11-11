export function normalizeHebrew(s: string): string {
  if (!s) return "";
  s = s.normalize("NFKC");
  s = s.replace(/[\u0591-\u05C7]/g, "");
  s = s.replace(
    /[ךםןףץ]/g,
    (c) => ({ ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" })[c]!,
  );
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
