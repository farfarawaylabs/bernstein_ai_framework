import { TASK_STATUS } from "@/models/enums";
import { getDBClient } from "../dl_common";

const TASK_FIELDS =
    "id, type, conversationId:conversation_id, duration: run_duration, title, status, data, createdAt:created_at";

export async function getTasksForUser(userId: string, status?: TASK_STATUS) {
    const db = getDBClient();

    if (status) {
        const { data, error } = await db.from("tasks").select(TASK_FIELDS).eq(
            "user_id",
            userId,
        ).eq("status", status).order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } else {
        const { data, error } = await db.from("tasks").select(TASK_FIELDS).eq(
            "user_id",
            userId,
        ).order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}
