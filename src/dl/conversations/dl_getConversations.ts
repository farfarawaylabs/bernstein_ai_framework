import { Conversation } from "@/framework/state/conversation";
import { getDBClient } from "../dl_common";

export async function getConversations(conversationIds: string[]) {
    const db = getDBClient();

    const { data, error } = await db.from("conversations").select("*").in(
        "id",
        conversationIds,
    );

    if (error) {
        throw new Error(error.message);
    }

    const conversations = data.map((conversation) => {
        return Conversation.deserializeConversationState(
            conversation.conversation_details as Record<string, any>,
        );
    });

    return conversations;
}
