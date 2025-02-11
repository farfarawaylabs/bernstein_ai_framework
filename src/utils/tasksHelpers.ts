import { sendEmail } from "@/services/sendgrid";

/**
 * Sends an email notification indicating that the content is ready.
 *
 * This function constructs a message based on the provided topic and sends an email
 * to the specified recipient. The email contains a link to the content, which is
 * identified by the conversationId.
 *
 * @param to - The email address of the recipient.
 * @param topic - The topic of the research report. If empty, a generic message is sent.
 * @param conversationId - The unique identifier for the conversation, used to generate the content link.
 * @returns A promise that resolves when the email has been sent.
 */
export async function sendContentReadyEmail(
    to: string,
    topic: string,
    conversationId: string,
) {
    // Construct the plain text message
    const text = topic !== ""
        ? `Your research report about ${topic} is ready. You can find it here: https://bernsteinai.com/app/content/${conversationId}`
        : `Your custom writing task is ready. You can find it here: https://bernsteinai.com/app/content/${conversationId}`;

    // Construct the HTML message
    const html = topic !== ""
        ? `<p>Your research report about ${topic} is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${conversationId}">here</a></p>`
        : `<p>Your custom writing task is ready. You can find it here: <a href="https://bernsteinai.com/app/content/${conversationId}">here</a></p>`;

    // Send the email using the sendEmail service
    return await sendEmail({
        from: "content@t.bernsteinai.com",
        fromName: "Bernstein AI",
        recipients: [to],
        subject: "Your research report is ready",
        text: text,
        html: html,
    });
}
