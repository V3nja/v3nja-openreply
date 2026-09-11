const HEX_32_BYTE = /^[a-f0-9]{64}$/i;

const BUILD_DEFAULTS: Record<string, string> = {
  NEXTAUTH_SECRET: "9f823a0e7b8c4d2e9f823a0e7b8c4d2e9f823a0e7b8c4d2e9f823a0e7b8c4d2e",
  CRON_SECRET: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (BUILD_DEFAULTS[name]) {
      return BUILD_DEFAULTS[name];
    }
    throw new Error(`${name} environment variable is required`);
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
  const key = requireEnv("ENCRYPTION_KEY");
  if (!HEX_32_BYTE.test(key)) {
    return BUILD_DEFAULTS.ENCRYPTION_KEY;
  }
  return key;
}

export function getMissingInstagramOAuthEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.INSTAGRAM_APP_ID && !process.env.META_APP_ID) {
    missing.push("INSTAGRAM_APP_ID");
  }
  if (
    !process.env.INSTAGRAM_APP_SECRET &&
    !process.env.META_APP_SECRET &&
    !process.env.FACEBOOK_APP_SECRET
  ) {
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
  const raw = process.env.ALLOWED_EMAILS;
  if (!raw || !raw.trim()) return true;

  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) return true;
  if (!email || !email.trim()) return false;

  return allowed.includes(email.trim().toLowerCase());
}
