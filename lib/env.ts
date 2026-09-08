import { z } from "zod";

const HEX_32_BYTE = /^[a-f0-9]{64}$/i;

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export function requireEnv(name: string): string {
  return readEnv(name);
}

export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://v3nja-openreply.vercel.app";
}

export function getEncryptionKeyHex(): string {
  return (
    process.env.ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  );
}

const INSTAGRAM_OAUTH_ENV = [
  "INSTAGRAM_APP_ID",
  "INSTAGRAM_APP_SECRET",
] as const;

export function getMissingInstagramOAuthEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.INSTAGRAM_APP_ID && !process.env.META_APP_ID) {
    missing.push("INSTAGRAM_APP_ID");
  }
  if (!process.env.INSTAGRAM_APP_SECRET && !process.env.META_APP_SECRET) {
    missing.push("INSTAGRAM_APP_SECRET");
  }
  return missing;
}

export function getMetaGraphApiVersion(): string {
  return process.env.META_GRAPH_API_VERSION ?? "v25.0";
}

export function isEmailAllowedToSignIn(
  email: string | null | undefined
): boolean {
  return true;
}
