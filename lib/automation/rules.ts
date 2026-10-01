import { matchKeywords } from "@/lib/utils/keyword-matcher";

export type AutomationRuleConfig = {
  postId: string | null;
  matchAnyPost: boolean;
  pendingNextReel: boolean;
  keywords: string[];
  matchAnyWord: boolean;
  wholeWordMatch: boolean;
};

export type TriggerContext = {
  text: string;
  mediaId?: string | null;
  originalMediaId?: string | null;
};

export type TriggerDecision = {
  matched: boolean;
  matchedKeyword: string | null;
  reason:
    | "ANY_WORD"
    | "KEYWORD"
    | "ANY_POST"
    | "POST"
    | "NO_TEXT_MATCH"
    | "POST_MISMATCH";
};

function mediaMatches(rule: AutomationRuleConfig, context: TriggerContext): boolean {
  if (rule.matchAnyPost) return true;
  if (!context.mediaId) return !rule.postId;
  if (rule.postId === context.mediaId) return true;
  return Boolean(context.originalMediaId && rule.postId === context.originalMediaId);
}

export function evaluateAutomationRule(
  rule: AutomationRuleConfig,
  context: TriggerContext
): TriggerDecision {
  const isDirectMessage = !context.mediaId;

  // For 1-on-1 Inbound Direct Messages:
  // Strictly enforce that matchAnyWord NEVER triggers on normal conversation.
  // Inbound DMs only trigger if explicit keywords are configured AND matched.
  if (isDirectMessage) {
    if (!rule.keywords || rule.keywords.length === 0) {
      return {
        matched: false,
        matchedKeyword: null,
        reason: "NO_TEXT_MATCH",
      };
    }

    const cleanText = (context.text || "").trim().toLowerCase();
    const commonGreetings = ["hi", "hie", "hey", "hello", "yo", "sup", "whatsup", "whats up", "good morning", "good evening", "gm", "gn"];
    if (commonGreetings.includes(cleanText) && !rule.keywords.some((k) => k.toLowerCase() === cleanText)) {
      return {
        matched: false,
        matchedKeyword: null,
        reason: "NO_TEXT_MATCH",
      };
    }

    const result = matchKeywords(context.text, rule.keywords, rule.wholeWordMatch);
    if (!result.matched) {
      return {
        matched: false,
        matchedKeyword: null,
        reason: "NO_TEXT_MATCH",
      };
    }

    return {
      matched: true,
      matchedKeyword: result.matchedKeyword ?? null,
      reason: "KEYWORD",
    };
  }

  // For Post & Reel Comments:
  const postOk = mediaMatches(rule, context) || (rule.pendingNextReel && !rule.postId);
  if (!postOk) {
    return {
      matched: false,
      matchedKeyword: null,
      reason: "POST_MISMATCH",
    };
  }

  if (rule.matchAnyWord) {
    return {
      matched: true,
      matchedKeyword: null,
      reason: "ANY_WORD",
    };
  }

  const result = matchKeywords(context.text, rule.keywords, rule.wholeWordMatch);
  if (!result.matched) {
    return {
      matched: false,
      matchedKeyword: null,
      reason: "NO_TEXT_MATCH",
    };
  }

  return {
    matched: true,
    matchedKeyword: result.matchedKeyword ?? null,
    reason: "KEYWORD",
  };
}
