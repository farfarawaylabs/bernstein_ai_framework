import { getDBClient } from "../dl_common";

export async function getToolCallsForTask(taskId: string) {
    const db = getDBClient();

    const { data, error } = await db
        .from("tool_calls")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
