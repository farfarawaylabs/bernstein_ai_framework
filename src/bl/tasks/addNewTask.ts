import { addTask } from "@/dl/tasks/addTask";
import { getUserLeftAllowence } from "../users/getUserLeftAllowence";

export async function addNewTask(
    userId: string,
    type: string = "generic",
    title: string,
    data?: Record<string, any>,
    conversationId?: string,
) {
    const userLeftAllowence = await getUserLeftAllowence(userId);

    if (userLeftAllowence <= 0) {
        return null;
    }

    const newTask = await addTask(userId, type, title, data, conversationId);

    return newTask.id;
}
