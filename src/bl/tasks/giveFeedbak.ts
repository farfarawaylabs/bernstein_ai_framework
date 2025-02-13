import { sendEmail } from "@/services/sendgrid";
import Environment from "@/utils/environment";

export async function giveFeedback(
    userId: string,
    taskId: string,
    feedback: boolean,
) {
    await sendEmail({
        from: "content@t.bernsteinai.com",
        fromName: "Bernstein AI",
        recipients: [Environment.FEEDBACK_EMAIL],
        subject: "Feedback for task",
        text: `User ${userId} has given feedback for task ${taskId}: He ${
            feedback ? "liked" : "did not like"
        } the task`,
        html: `
        <p>User ${userId} has given feedback for task ${taskId}: He ${
            feedback ? "liked" : "did not like"
        } the task</p>
        `,
    });
}
