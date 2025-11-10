import { env } from "../env";

export function getBaseUrl() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - window is only defined in the browser
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - window is only defined in the browser
    return (window as { location: { origin: string } }).location.origin;
  }
  if (env.VERCEL_ENV === "production") {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_ENV === "preview") {
    return `https://${env.VERCEL_URL}`;
  }

  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
