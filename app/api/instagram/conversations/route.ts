export const dynamic = "force-dynamic";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { prisma } from "@/lib/db/client";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { getConversations, MetaApiError } from "@/lib/meta/client";
import { getDMQueue, MANUAL_MESSAGE_JOB_NAME } from "@/lib/queue/client";
import { decryptToken } from "@/lib/meta/oauth";

export interface ConversationListItem {
  id: string;
  contact: { id: string; username: string | null };
  updatedTime: string | null;
  lastMessage: {
    text: string;
    fromMe: boolean;
    createdTime: string | null;
  } | null;
}

export interface ConversationsResponse {
  conversations: ConversationListItem[];
  account: { id: string; username: string; instagramId: string };
}

export async function GET(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await getWorkspaceInstagramAccount(
    context.workspaceId,
    request.nextUrl.searchParams.get("instagramAccountId")
  );
  if (!account) {
    return NextResponse.json(
      { success: false, error: "Instagram account not connected." },
      { status: 400 }
    );
  }

  try {
    const accessToken = decryptToken(account.accessToken);
    const raw = await getConversations(accessToken, account.instagramId);

    const conversations: ConversationListItem[] = raw.map((c) => {
      const participants = c.participants?.data ?? [];
      const contact = participants.find((p) => p.id !== account.instagramId) ?? participants[0] ?? null;
      const last = c.messages?.data?.[0] ?? null;
      return {
        id: c.id,
        contact: { id: contact?.id ?? "", username: contact?.username ?? null },
        updatedTime: c.updated_time ?? null,
        lastMessage: last
          ? {
              text: last.message ?? "",
              fromMe: last.from?.id === account.instagramId,
              createdTime: last.created_time ?? null,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          conversations,
          account: { id: account.id, username: account.username, instagramId: account.instagramId },
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Conversations GET]", error instanceof Error ? error.message : "unknown error");
    const message = error instanceof MetaApiError ? error.message : "Failed to load conversations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { instagramAccountId?: string; recipientId?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const recipientId = typeof body.recipientId === "string" ? body.recipientId.trim() : "";
  if (!text || !recipientId) {
    return NextResponse.json({ success: false, error: "Recipient and message are required" }, { status: 400 });
  }
  if (text.length > 5000) {
    return NextResponse.json({ success: false, error: "Message is too long" }, { status: 400 });
  }

  const account = await prisma.instagramAccount.findFirst({
    where: {
      id: body.instagramAccountId,
      workspaceId: context.workspaceId,
    },
    select: { id: true, instagramId: true, accessToken: true },
  });
  if (!account) {
    return NextResponse.json({ success: false, error: "Instagram account not found" }, { status: 404 });
  }

  const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

  try {
    await getDMQueue().add(
      MANUAL_MESSAGE_JOB_NAME,
      {
        workspaceId: context.workspaceId,
        instagramAccountId: account.id,
        recipientId,
        text,
        requestId,
      },
      { jobId: `manual_${requestId}` }
    );

    return NextResponse.json(
      {
        success: true,
        queued: true,
        data: { requestId },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Conversations POST]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, error: "Failed to queue message" }, { status: 500 });
  }
}
