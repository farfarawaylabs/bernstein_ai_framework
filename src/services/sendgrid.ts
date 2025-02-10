import Environment from "@/utils/environment";

export interface EmailMessage {
	from: string;
	fromName: string;
	recipients: string[];
	subject: string;
	text: string;
	html?: string;
	attachments?: {
		content: string;
		filename: string;
		type: string;
		disposition: string;
	}[];
}

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
