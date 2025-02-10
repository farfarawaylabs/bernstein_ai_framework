import { sendEmail } from "@/services/sendgrid";

export async function sendContentReadyEmail(
    to: string,
    topic: string,
    conversationId: string,
) {
    const text = topic !== ""
        ? `Your research report about ${topic} is ready. You can find it here: https://bernsteinai.com/app/content/${conversationId}`
        : `Your custom writing task is ready. You can find it here: https://bernsteinai.com/app/content/${conversationId}`;

    const html = topic !== ""
        ? `<p>Your research report about ${topic} is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${conversationId}">here</a></p>`
        : `<p>Your custom writing task is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${conversationId}">here</a></p>`;

    return await sendEmail({
        from: "content@t.bernsteinai.com",
        fromName: "Bernstein AI",
        recipients: [to],
        subject: "Your research report is ready",
        text: text,
        html: html,
    });
}
