import { addNewTask } from "./addNewTask";
import { TASK_TYPES } from "@/models/enums";
import { getUser } from "../users/getUser";
import { sendTaskToQueue } from "./sendTaskToQueue";

export async function generateResearchReportTask(
    userId: string,
    topic: string,
    instructions: string,
) {
    const user = await getUser(userId);
    const data = {
        topic,
        toneOfVoice: "",
        instructions,
        email: user.email!,
    };

    const newTaskId = await addNewTask(
        userId,
        TASK_TYPES.RESEARCH_REPORT,
        data.topic,
        data,
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
        title: data.topic,
        data: data,
    });

    return {
        success: true,
        taskId: newTaskId,
    };
}
