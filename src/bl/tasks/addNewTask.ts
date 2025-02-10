import { addTask } from "@/dl/tasks/addTask";
import { getUserLeftAllowence } from "../users/getUserLeftAllowence";

export async function addNewTask(
    userId: string,
    type: string = "generic",
    conversationId?: string,
) {
    const userLeftAllowence = await getUserLeftAllowence(userId);

    if (userLeftAllowence <= 0) {
        return null;
    }

    const newTask = await addTask(userId, type, conversationId);

    return newTask.id;
}
