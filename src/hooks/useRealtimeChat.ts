import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type ChatMessageCallback = (message: any) => void;
type PresenceCallback = (presence: any) => void;

export function useRealtimeChat(conversationId: string, onMessage: ChatMessageCallback, onPresence?: PresenceCallback) {
  useEffect(() => {
    if (!conversationId) return;

    const msgChannel = supabase.channel(`chat:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => onMessage(payload.new))
      .subscribe();

    const presenceChannel = supabase.channel(`presence:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        if (onPresence) onPresence(presenceChannel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, onMessage, onPresence]);
}
