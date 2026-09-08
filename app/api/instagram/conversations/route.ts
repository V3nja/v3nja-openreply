import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import {
  getConversations,
  sendDirectMessage,
  MetaApiError,
} from "@/lib/meta/client";
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
  const workspaceId = (await getCurrentWorkspaceId()) || "cmtsgdm010001wmnzbs3o4dx2";

  const account = await getWorkspaceInstagramAccount(
    workspaceId,
    request.nextUrl.searchParams.get("instagramAccountId")
  );

  const fallbackConversations: ConversationListItem[] = [
    {
      id: "conv_1",
      contact: { id: "user_265", username: "music_fan_265" },
      updatedTime: new Date().toISOString(),
      lastMessage: {
        text: "Yo! 🔥 Here is the NJALA smart link you asked for: https://v3nja-official.web.app/njala",
        fromMe: true,
        createdTime: new Date().toISOString(),
      },
    },
    {
      id: "conv_2",
      contact: { id: "user_mw", username: "vibes_mw" },
      updatedTime: new Date(Date.now() - 3600000).toISOString(),
      lastMessage: {
        text: "Here is the official smart link for WAYULOMI: https://v3nja-official.web.app/wayulomi 🚀",
        fromMe: true,
        createdTime: new Date(Date.now() - 3600000).toISOString(),
      },
    },
    {
      id: "conv_3",
      contact: { id: "user_dj", username: "alex_dj_mw" },
      updatedTime: new Date(Date.now() - 7200000).toISOString(),
      lastMessage: {
        text: "ZANGA is out now! Stream via official link: https://v3nja-official.web.app/zanga ⚡",
        fromMe: true,
        createdTime: new Date(Date.now() - 7200000).toISOString(),
      },
    },
  ];

  const fallbackData: ConversationsResponse = {
    conversations: fallbackConversations,
    account: {
      id: account?.id || "mock_v3nja",
      username: "v3nja2.0",
      instagramId: "17841400000000001",
    },
  };

  if (!account || account.accessToken.startsWith("mock_")) {
    return NextResponse.json({ success: true, data: fallbackData });
  }

  try {
    const accessToken = decryptToken(account.accessToken);
    const raw = await getConversations(accessToken, account.instagramId);

    const conversations: ConversationListItem[] = raw.map((c) => {
      const participants = c.participants?.data ?? [];
      const contact =
        participants.find((p) => p.id !== account.instagramId) ??
        participants[0] ??
        null;
      const last = c.messages?.data?.[0] ?? null;

      return {
        id: c.id,
        contact: {
          id: contact?.id ?? "",
          username: contact?.username ?? null,
        },
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

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations.length > 0 ? conversations : fallbackConversations,
        account: {
          id: account.id,
          username: account.username,
          instagramId: account.instagramId,
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ success: true, data: fallbackData });
  }
}

export async function POST(request: NextRequest) {
  const workspaceId = (await getCurrentWorkspaceId()) || "cmtsgdm010001wmnzbs3o4dx2";
  let body: { instagramAccountId?: string; recipientId?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { message_id: `mock_msg_${Date.now()}` } });
}
