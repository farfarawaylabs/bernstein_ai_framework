import WrittenContentEditorAgent from "@/agents/writing/generic/WrittenContentEditorAgent";
import { addNewTask } from "./addNewTask";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "@/models/enums";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { sendEmail } from "@/services/sendgrid";
import { updateTask } from "@/dl/tasks/updateTask";
import { getUser } from "../users/getUser";
import { Context } from "hono";

export async function generateCustomWritingTask(
    userId: string,
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
            runTask(newTaskId, userId, user.email!, instructions),
        );
        return {
            success: true,
            conversationId: newTaskId,
        };
    } else {
        return await runTask(newTaskId, userId, user.email!, instructions);
    }
}

async function runTask(
    taskId: string,
    userId: string,
    email: string,
    instructions: string,
) {
    const writerAgent = new WrittenContentEditorAgent({
        instructions: instructions,
        topic: "topic",
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
        subject: "Your custom writing task is ready",
        text:
            `Your custom writing task is ready. You can find it here: https://bernsteinai.com/app/content/${response.conversationId}`,
        html:
            `<p>Your custom writing task is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${response.conversationId}">here</a></p>`,
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
