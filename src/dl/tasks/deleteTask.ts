import { getDBClient } from "../dl_common";

export async function deleteTask(taskId: string) {
    const db = getDBClient();
    const { error } = await db.from("tasks").delete().eq("id", taskId);
    if (error) {
        throw new Error(error.message);
    }
}
