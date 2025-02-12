import { addNewTask } from "./addNewTask";
import { TASK_TYPES } from "@/models/enums";
import { getUser } from "../users/getUser";
import { sendTaskToQueue } from "./sendTaskToQueue";

export async function generateBlogPostTask(
    userId: string,
    topic: string,
    toneOfVoice: string,
    instructions: string,
) {
    const user = await getUser(userId);

    const data = {
        topic,
        toneOfVoice,
        instructions,
        email: user.email!,
    };

    const newTaskId = await addNewTask(
        userId,
        TASK_TYPES.BLOG_POST,
        topic,
        data,
    );

    if (!newTaskId) {
        return {
            success: false,
            errorType: "no_allowence",
        };
    }

    await sendTaskToQueue({
        type: TASK_TYPES.BLOG_POST,
        taskId: newTaskId,
        userId: userId,
        title: topic,
        data: data,
    });

    return {
        success: true,
        taskId: newTaskId,
    };
}
