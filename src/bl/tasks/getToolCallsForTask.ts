import { getToolCallsForTask as getToolCallsForTaskDL } from "@/dl/tools/getToolCallsForTask";
import { ToolCallsHistory } from "@/models/ToolCallsHistory";

export async function getToolCallsForTask(
    taskId: string,
): Promise<ToolCallsHistory> {
    const toolCalls = await getToolCallsForTaskDL(taskId);

    return {
        items: toolCalls.map((toolCall) => {
            let fixedJsonString = "";
            let isJson = true;

            try {
                const response = JSON.parse(toolCall.result as string);
                fixedJsonString = response.replace(
                    /("[^"]*")|(\n|\r)/g,
                    (match: string, group1: string) => {
                        // If the match is inside a quoted string, keep it as is
                        if (group1) return group1;
                        // Otherwise, replace newlines with an empty string (remove them)
                        return "";
                    },
                );
                fixedJsonString = JSON.parse(fixedJsonString);
            } catch {
                isJson = false;
                fixedJsonString = toolCall.result as string;
            }

            return {
                id: toolCall.id,
                startedAt: toolCall.created_at,
                type: toolCall.type,
                callParams: JSON.parse(toolCall.call as string),
                response: isJson ? fixedJsonString : fixedJsonString,
            };
        }),
    };
}
