import { describe, expect, it } from "vitest";
import { evaluateAutomationRule } from "./rules";

describe("evaluateAutomationRule", () => {
  const baseRule = {
    postId: null,
    matchAnyPost: false,
    pendingNextReel: true,
    keywords: ["link", "song"],
    matchAnyWord: false,
    wholeWordMatch: true,
  };

  it("matches a pending-next-reel campaign on a concrete media id", () => {
    const result = evaluateAutomationRule(baseRule, {
      text: "send me the link",
      mediaId: "reel-123",
    });

    expect(result.matched).toBe(true);
    expect(result.matchedKeyword).toBe("link");
  });

  it("does not match an unrelated keyword", () => {
    const result = evaluateAutomationRule(baseRule, {
      text: "love this",
      mediaId: "reel-123",
    });

    expect(result.matched).toBe(false);
    expect(result.reason).toBe("NO_TEXT_MATCH");
  });

  it("does not let a bound campaign match a different reel", () => {
    const result = evaluateAutomationRule(
      { ...baseRule, postId: "reel-123", pendingNextReel: false },
      {
        text: "send me the link",
        mediaId: "reel-456",
      }
    );

    expect(result.matched).toBe(false);
    expect(result.reason).toBe("POST_MISMATCH");
  });
});
