import { getDBClient } from "../dl_common";

export async function updateTask(
    taskId: string,
    runDuration: number,
    status: string,
    conversationId?: string,
) {
    const db = getDBClient();

    const { data, error } = await db
        .from("tasks")
        .update({
            run_duration: runDuration,
            status: status,
            conversation_id: conversationId,
        })
        .eq("id", taskId);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
