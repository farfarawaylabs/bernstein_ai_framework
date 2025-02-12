import { getDBClient } from "../dl_common";

export async function addTask(
    userId: string,
    type: string,
    title: string,
    taskData?: Record<string, any>,
    conversationId?: string,
) {
    const db = getDBClient();
    const { data, error } = await db
        .from("tasks")
        .insert({
            user_id: userId,
            type,
            conversation_id: conversationId,
            title,
            data: taskData,
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
