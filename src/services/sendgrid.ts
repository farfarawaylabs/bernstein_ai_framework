import Environment from '@/utils/environment';

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
			{ type: 'text/plain', value: email.text },
			{ type: 'text/html', value: email.html },
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

	console.log('Sending email: ', Environment.SENDGRID_API_KEY);
	console.log(JSON.stringify(message, null, 2));
	try {
		const result = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${Environment.SENDGRID_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});

		console.log(JSON.stringify(result, null, 2));
		return true;
	} catch (error) {
		console.error('error sending email: ', error);
		throw error;
	}
};
