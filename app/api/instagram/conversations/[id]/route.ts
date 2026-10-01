export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { getConversationMessages, MetaApiError } from "@/lib/meta/client";
import { decryptToken } from "@/lib/meta/oauth";

export interface ThreadMessage {
  id: string;
  text: string;
  fromMe: boolean;
  fromUsername: string | null;
  createdTime: string | null;
  mediaAttachment?: {
    type: "image" | "video" | "audio" | "file";
    url: string;
    previewUrl?: string;
    name?: string;
  } | null;
  isVoice?: boolean;
  voiceAudioUrl?: string | null;
  voiceDuration?: string | null;
}

export interface ThreadResponse {
  messages: ThreadMessage[];
}

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteProps) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ success: false, error: "Conversation ID is required" }, { status: 400 });
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
    const raw = await getConversationMessages(accessToken, conversationId);
    const messages: ThreadMessage[] = raw
      .map((m) => {
        const attachment = m.attachments?.data?.[0];
        let mediaAttachment: ThreadMessage["mediaAttachment"] = null;
        let isVoice = false;
        let voiceAudioUrl: string | null = null;

        if (attachment) {
          const mime = attachment.mime_type || "";
          const fileUrl = attachment.file_url || attachment.image_data?.url || attachment.video_data?.url || attachment.audio_data?.url;
          if (fileUrl) {
            if (mime.startsWith("audio/") || attachment.audio_data || fileUrl.includes(".mp3") || fileUrl.includes(".m4a") || fileUrl.includes(".wav") || fileUrl.includes(".aac") || fileUrl.includes(".webm")) {
              isVoice = true;
              voiceAudioUrl = fileUrl;
              mediaAttachment = {
                type: "audio",
                url: fileUrl,
              };
            } else if (mime.startsWith("video/") || attachment.video_data || fileUrl.includes(".mp4")) {
              mediaAttachment = {
                type: "video",
                url: fileUrl,
                previewUrl: attachment.video_data?.preview_url,
              };
            } else if (mime.startsWith("image/") || attachment.image_data) {
              mediaAttachment = {
                type: "image",
                url: fileUrl,
                previewUrl: attachment.image_data?.preview_url,
              };
            } else {
              mediaAttachment = {
                type: "file",
                url: fileUrl,
                name: attachment.name,
              };
            }
          }
        }

        return {
          id: m.id,
          text: m.message ?? "",
          fromMe: m.from?.id === account.instagramId,
          fromUsername: m.from?.username ?? null,
          createdTime: m.created_time ?? null,
          mediaAttachment,
          isVoice,
          voiceAudioUrl,
          voiceDuration: isVoice ? "0:15" : null,
        };
      })
      .reverse();

    return NextResponse.json(
      { success: true, data: { messages } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Conversation Messages]", error instanceof Error ? error.message : "unknown error");
    const message = error instanceof MetaApiError ? error.message : "Failed to load messages";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
