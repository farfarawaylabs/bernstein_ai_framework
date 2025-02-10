import { addNewTask } from "./addNewTask";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { updateTask } from "@/dl/tasks/updateTask";
import { getUser } from "../users/getUser";
import { Context } from "hono";
import { ArticleWriterAgent } from "@/agents/writing/articles/ArticleWriterAgent";
import { sendContentReadyEmail } from "@/utils/tasksHelpers";

export async function generateArticleTask(
    userId: string,
    topic: string,
    toneOfVoice: string,
    instructions: string,
    ctx?: Context,
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

    if (ctx) {
        ctx.executionCtx.waitUntil(
            runTask(
                newTaskId,
                userId,
                user.email!,
                topic,
                toneOfVoice,
                instructions,
            ),
        );
        return {
            success: true,
            taskId: newTaskId,
        };
    } else {
        return await runTask(
            newTaskId,
            userId,
            user.email!,
            topic,
            toneOfVoice,
            instructions,
        );
    }
}

async function runTask(
    taskId: string,
    userId: string,
    email: string,
    topic: string,
    toneOfVoice: string,
    instructions: string,
) {
    const writerAgent = new ArticleWriterAgent({
        instructions: instructions,
        topic: topic,
        toneOfVoice: toneOfVoice,
        model: AI_MODELS.CHATGPT4O,
        serializer: new SupabaseSerializer(
            userId,
        ),
    });

    const startTime = new Date();
    const response = await writerAgent.run();
    const endTime = new Date();
    const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    await sendContentReadyEmail(email, topic, response.conversationId);

    await updateTask(
        taskId,
        Math.round(durationInSeconds),
        TASK_STATUS.COMPLETED,
        response.conversationId,
    );

    return {
        success: true,
        conversationId: response.conversationId,
    };
}
