import { addNewTask } from "./addNewTask";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { sendEmail } from "@/services/sendgrid";
import { updateTask } from "@/dl/tasks/updateTask";
import { getUser } from "../users/getUser";
import { Context } from "hono";
import { BlogPostWriterAgent } from "@/agents/writing/blogs/blogPostWriterAgent";

export async function generateBlogPostTask(
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
    const writerAgent = new BlogPostWriterAgent({
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

    await sendEmail({
        from: "report@bernstein.deathstarlabs.com",
        fromName: "Bernstein AI",
        recipients: [email],
        subject: "Your blog post is ready",
        text:
            `Your blog post about ${topic} is ready. You can find it here: https://bernsteinao.com/app/content/${response.conversationId}`,
        html:
            `<p>Your blog post about ${topic} is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${response.conversationId}">here</a></p>`,
    });

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
