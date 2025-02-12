import { addNewTask } from "./addNewTask";
import { TASK_TYPES } from "@/models/enums";
import { getUser } from "../users/getUser";
import { sendTaskToQueue } from "./sendTaskToQueue";

export async function generateCustomWritingTask(
    userId: string,
    instructions: string,
) {
    const user = await getUser(userId);
    const data = {
        topic: `Custom - ${instructions.substring(0, 15)}`,
        toneOfVoice: "",
        instructions: instructions,
        email: user.email!,
    };

    const newTaskId = await addNewTask(
        userId,
        TASK_TYPES.GENERIC_WRITING,
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
        type: TASK_TYPES.GENERIC_WRITING,
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
