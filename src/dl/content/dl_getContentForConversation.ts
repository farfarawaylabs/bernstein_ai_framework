import { getDBClient } from "../dl_common";

export async function getContentForConversation(conversationId: string) {
    const db = getDBClient();

    const { data, error } = await db.from("content").select("*").eq(
        "conversation_id",
        conversationId,
    );

    if (error) {
        throw new Error(error.message);
    }

    if (data.length > 0) {
        return data[0];
    }

    return null;
}
