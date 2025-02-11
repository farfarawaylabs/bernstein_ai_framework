import { ToolCall } from "@/framework/operators";
import { getDBClient } from "../dl_common";

export async function addToolCall(
    taskId: string,
    toolCall: ToolCall,
    result: Record<string, string>,
) {
    const db = getDBClient();
    const { data, error } = await db
        .from("tool_calls")
        .insert({
            task_id: taskId,
            type: toolCall.name,
            call: JSON.stringify(toolCall),
            result: JSON.stringify(result),
        })
        .select("id, task_id, type, call, result, created_at, updated_at")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
