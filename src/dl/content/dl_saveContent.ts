import { getDBClient } from "../dl_common";

export async function saveContent(content: string, conversationId: string) {
    const db = getDBClient();

    const { data, error } = await db.from("content").insert({
        content,
        conversation_id: conversationId,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
