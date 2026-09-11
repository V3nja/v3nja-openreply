const HEX_32_BYTE = /^[a-f0-9]{64}$/i;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
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
    throw new Error("ENCRYPTION_KEY must be exactly 64 hexadecimal characters");
  }
  return key;
}

export function getMissingInstagramOAuthEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.INSTAGRAM_APP_ID) missing.push("INSTAGRAM_APP_ID");
  if (!process.env.INSTAGRAM_APP_SECRET) missing.push("INSTAGRAM_APP_SECRET");
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
