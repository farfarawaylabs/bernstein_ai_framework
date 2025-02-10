import { Conversation } from "@/framework/state/conversation";
import { getDBClient } from "../dl_common";

export async function saveConversation(
    conversationId: string,
    userId: string,
    conversation: Conversation,
) {
    const db = getDBClient();

    const { data, error } = await db
        .from("conversations")
        .upsert({
            id: conversationId,
            user_id: userId,
            conversation_details: conversation.serializeState(),
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
