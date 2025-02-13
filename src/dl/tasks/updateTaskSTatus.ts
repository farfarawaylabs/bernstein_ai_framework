import { getDBClient } from "../dl_common";

export async function updateTaskStatus(
    taskId: string,
    status: string,
) {
    const db = getDBClient();

    const { data, error } = await db
        .from("tasks")
        .update({
            status: status,
        })
        .eq("id", taskId);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
