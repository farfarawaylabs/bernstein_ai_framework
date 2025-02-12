import { getConversations } from "@/dl/conversations/dl_getConversations";
import { getTasksForUser } from "@/dl/tasks/getTasksForUser";
import { TASK_STATUS } from "@/models/enums";

export async function getContentForUser(userId: string) {
    const tasks = await getTasksForUser(userId, TASK_STATUS.COMPLETED);

    const conversationIds = tasks.map((task) => task.conversation_id!);

    const conversations = await getConversations(conversationIds);
}
