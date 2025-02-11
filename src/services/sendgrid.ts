import Environment from "@/utils/environment";

/**
 * Interface representing the structure of an email message.
 */
export interface EmailMessage {
	from: string; // The sender's email address
	fromName: string; // The sender's name
	recipients: string[]; // List of recipient email addresses
	subject: string; // Subject of the email
	text: string; // Plain text content of the email
	html?: string; // Optional HTML content of the email
	attachments?: { // Optional attachments for the email
		content: string; // Base64 encoded content of the attachment
		filename: string; // Name of the attachment file
		type: string; // MIME type of the attachment
		disposition: string; // Content disposition of the attachment
	}[];
}

/**
 * Sends an email using the SendGrid API.
 *
 * @param email - The email message to be sent.
 * @returns A promise that resolves to true if the email is sent successfully.
 * @throws An error if the email sending fails.
 */
export const sendEmail = async (email: EmailMessage) => {
	const message = {
		from: {
			email: email.from,
			name: email.fromName,
		},
		subject: email.subject,
		content: [
			{ type: "text/plain", value: email.text },
			{ type: "text/html", value: email.html },
		],
		personalizations: [
			{
				to: email.recipients.map((currRecipient) => ({
					email: currRecipient,
				})),
			},
		],
		attachments: email.attachments,
	};

	try {
		const result = await fetch("https://api.sendgrid.com/v3/mail/send", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${Environment.SENDGRID_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		});

		console.log("Sending email result: ", result);
		return true;
	} catch (error) {
		console.error("error sending email: ", error);
		throw error;
	}
};
