import { getTask } from "@/dl/tasks/getTask";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { TASK_STATUS } from "@/models/enums";
import { ProducedContent } from "@/models/ProducedContent";
import { getToolCallsForTask } from "@/bl/tasks/getToolCallsForTask";

export async function getContentByTaskId(
    taskId: string,
    getToolCallsHistory: boolean = true,
    includeRawConversation: boolean = false,
) {
    const task = await getTask(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    if (task.status !== TASK_STATUS.COMPLETED) {
        return null;
    }

    const serializer = new SupabaseSerializer("");
    const conversation = await serializer.load(task.conversation_id!);

    const toolCalls = getToolCallsHistory
        ? await getToolCallsForTask(taskId)
        : undefined;

    const producedContent = new ProducedContent(
        conversation,
        undefined,
        toolCalls,
    );

    return {
        ...producedContent.produceContent(),
        rawConversation: includeRawConversation
            ? conversation.serializeState()
            : undefined,
        toolCallsHistory: toolCalls,
    };
}
