import { getDBClient } from "../dl_common";

export async function getTask(taskId: string) {
    const db = getDBClient();

    const { data, error } = await db
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
