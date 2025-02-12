import { deleteTask as deleteTaskDL } from "@/dl/tasks/deleteTask";
import { getTask } from "@/dl/tasks/getTask";

export async function deleteTask(userId: string, taskId: string) {
    const task = await getTask(taskId);

    if (task.user_id !== userId) {
        throw new Error("Task not found");
    }

    await deleteTaskDL(taskId);
}
