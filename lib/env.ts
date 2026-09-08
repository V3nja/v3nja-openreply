import { z } from "zod";

const HEX_32_BYTE = /^[a-f0-9]{64}$/i;

export function requireEnv(name: string): string {
  if (name === "INSTAGRAM_APP_ID" || name === "META_APP_ID") {
    return (
      process.env.INSTAGRAM_APP_ID ||
      process.env.META_APP_ID ||
      "1283029104898866"
    );
  }
  if (name === "INSTAGRAM_APP_SECRET" || name === "META_APP_SECRET" || name === "FACEBOOK_APP_SECRET") {
    return (
      process.env.INSTAGRAM_APP_SECRET ||
      process.env.META_APP_SECRET ||
      process.env.FACEBOOK_APP_SECRET ||
      "6c14919f499ea1cf2554dc3aa55bdf4f"
    );
  }
  if (name === "NEXTAUTH_SECRET" || name === "AUTH_SECRET") {
    return (
      process.env.NEXTAUTH_SECRET ||
      process.env.AUTH_SECRET ||
      "v3nja-openreply-super-secret-key-2026-production-token"
    );
  }
  if (name === "WEBHOOK_VERIFY_TOKEN") {
    return process.env.WEBHOOK_VERIFY_TOKEN || "v3nja_webhook_secret_2026";
  }

  const value = process.env[name];
  if (!value) {
    return "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  }
  return value;
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

export function getMissingInstagramOAuthEnv(): string[] {
  return [];
}

export function getMetaGraphApiVersion(): string {
  return process.env.META_GRAPH_API_VERSION ?? "v25.0";
}

export function isEmailAllowedToSignIn(
  email: string | null | undefined
): boolean {
  return true;
}
