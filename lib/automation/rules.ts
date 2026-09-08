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
  // `pendingNextReel` is intentionally treated as an account-level future-post
  // flag elsewhere. Once a concrete media id exists, it behaves like a normal
  // any-post campaign rather than silently matching unrelated historic media.
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
      reason: context.mediaId ? "ANY_WORD" : "ANY_WORD",
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
    reason: context.mediaId ? "KEYWORD" : "KEYWORD",
  };
}
