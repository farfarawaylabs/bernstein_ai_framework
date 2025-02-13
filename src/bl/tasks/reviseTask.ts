import { getConversation } from "@/dl/conversations/dl_getConversation";
import { getTask } from "@/dl/tasks/getTask";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { HumanMessage } from "@langchain/core/messages";
import { sendReviseTaskToQueue } from "./sendTaskToQueue";
import { getUser } from "../users/getUser";

export async function reviseTask(
    userId: string,
    taskId: string,
    revisionInstructions: string,
) {
    const task = await getTask(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    if (task.status !== TASK_STATUS.COMPLETED) {
        throw new Error("Task is not completed");
    }

    if (task.user_id !== userId) {
        throw new Error("Task is not owned by the user");
    }
    const user = await getUser(userId);

    const conversation = await getConversation(task.conversation_id!);

    conversation.addMessages([
        new HumanMessage(
            `User feedback and revisions request: ${revisionInstructions}`,
        ),
    ]);

    await SupabaseSerializer.saveConversation(conversation, userId);

    await sendReviseTaskToQueue({
        type: task.type as TASK_TYPES,
        taskId: taskId,
        userId: userId,
        title: task.title!,
        data: { ...task.data, email: user.email } as any,
    });
}
