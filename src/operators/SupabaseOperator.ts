import { Operator, OperatorConfig, ToolCall } from "@/framework/operators";
import { addToolCall } from "@/dl/tools/addToolCall";

export class SupabaseOperator extends Operator {
    constructor(config: OperatorConfig) {
        if (!config.taskId) {
            throw new Error("The SupabaseOperator requires a taskId");
        }

        super({
            ...config,
            serializeToolCall: async (
                taskId: string,
                toolCall: ToolCall,
                result: any,
            ) => {
                await addToolCall(taskId, toolCall, result);
            },
        });
    }
}
