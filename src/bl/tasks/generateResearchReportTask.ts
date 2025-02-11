import { addNewTask } from "./addNewTask";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { updateTask } from "@/dl/tasks/updateTask";
import { getUser } from "../users/getUser";
import { Context } from "hono";
import ResearchReportAgent from "@/agents/writing/researchReports/ResearchReportAgent";
import { sendContentReadyEmail } from "@/utils/tasksHelpers";
import { sendTaskToQueue } from "./sendTaskToQueue";

export async function generateResearchReportTask(
    userId: string,
    topic: string,
    instructions: string,
) {
    const user = await getUser(userId);
    const newTaskId = await addNewTask(
        userId,
        TASK_TYPES.GENERIC_WRITING,
    );

    if (!newTaskId) {
        return {
            success: false,
            errorType: "no_allowence",
        };
    }

    await sendTaskToQueue({
        type: TASK_TYPES.RESEARCH_REPORT,
        taskId: newTaskId,
        userId: userId,
        data: {
            topic: topic,
            toneOfVoice: "",
            instructions: instructions,
            email: user.email!,
        },
    });

    return {
        success: true,
        taskId: newTaskId,
    };
}
