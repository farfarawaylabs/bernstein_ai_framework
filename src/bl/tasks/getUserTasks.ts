import { getTasksForUser } from "@/dl/tasks/getTasksForUser";
import { TASK_STATUS } from "@/models/enums";

export async function getUserTasks(userId: string, status?: TASK_STATUS) {
    const tasks = await getTasksForUser(userId, status);

    return tasks;
}
