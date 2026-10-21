/**
 * CORS configuration for server request handling.
 * Features:
 * - Origin validation
 * - Header generation
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

const ALLOWED_ORIGINS = [
  ...new Set([
    "https://codex.dulapahv.dev",
    "https://dev-codex.dulapahv.dev",
    "http://localhost:3000",
    ...(process.env.CLIENT_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];

const getAllowedOrigin = (origin: string | undefined): string => {
  if (process.env.NODE_ENV !== "production") {
    return origin || "*";
  }

  // For security, avoid returning '*' in production
  if (!origin) {
    return ALLOWED_ORIGINS[0];
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }

  return ALLOWED_ORIGINS[0];
};

const getCorsHeaders = (origin: string | undefined) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(origin),
  "Access-Control-Allow-Methods": "GET",
  Vary: "Origin",
});

export { ALLOWED_ORIGINS, getCorsHeaders };
