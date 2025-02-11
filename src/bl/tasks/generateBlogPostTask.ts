import { addNewTask } from "./addNewTask";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { updateTask } from "@/dl/tasks/updateTask";
import { getUser } from "../users/getUser";
import { Context } from "hono";
import { BlogPostWriterAgent } from "@/agents/writing/blogs/blogPostWriterAgent";
import { sendContentReadyEmail } from "@/utils/tasksHelpers";
import { sendTaskToQueue } from "./sendTaskToQueue";

export async function generateBlogPostTask(
    userId: string,
    topic: string,
    toneOfVoice: string,
    instructions: string,
) {
    const user = await getUser(userId);
    const newTaskId = await addNewTask(
        userId,
        TASK_TYPES.BLOG_POST,
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
        data: {
            topic: topic,
            toneOfVoice: toneOfVoice,
            instructions: instructions,
            email: user.email!,
        },
    });

    return {
        success: true,
        taskId: newTaskId,
    };
}
