import { Conversation } from "@/framework/state/conversation";
import { getDBClient } from "../dl_common";

export async function getConversation(conversationId: string) {
    const db = getDBClient();

    const { data, error } = await db.from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return Conversation.deserializeConversationState(
        data.conversation_details as Record<string, any>,
    );
}
