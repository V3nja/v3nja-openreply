/**
 * V3NJA WRLD Heartfelt Professional Artist DM Formatter
 */

export function formatBrandedArtistDM({
  rawMessage,
  commenterName,
  smartLinkUrl,
  followGated = false,
  followPrompt = "",
}: {
  rawMessage?: string | null;
  commenterName?: string | null;
  campaignTitle?: string | null;
  smartLinkUrl?: string | null;
  followGated?: boolean;
  followPrompt?: string | null;
}): string {
  const username = (commenterName || "there").replace(/^@/, "");

  if (followGated && followPrompt) {
    return followPrompt.replace(/\{username\}/gi, username);
  }

  let body = rawMessage?.trim() || "";
  if (body) {
    body = body.replace(/\{username\}/gi, username);
  } else {
    body = `✨ Thank you for the support! Tap the button below to stream the official music. Much love! ✨`;
  }

  return body;
}
