import { getDBClient } from "../dl_common";

export async function addTask(
    userId: string,
    type: string,
    conversationId?: string,
) {
    const db = getDBClient();
    const { data, error } = await db
        .from("tasks")
        .insert({
            user_id: userId,
            type,
            conversation_id: conversationId,
        })
        .select("id, user_id, type, conversation_id, status, created_at")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
