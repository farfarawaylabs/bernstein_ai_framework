import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { sendEmail } from '@/services/sendgrid';

const askUserToolSchema: StructuredToolParams = {
	name: 'ask_user_input',
	description: 'Use this tool to ask the user for input',
	schema: z.object({
		question: z.string().describe('The question to ask the user'),
	}),
};

const askUserTool = tool(async (input: any) => {
	const { question } = input;
	const result = await sendEmail({
		from: 'shahar@farfarawaylabs.com',
		fromName: 'Bernstein AI',
		recipients: ['test@test.com'],
		subject: 'Test',
		text: 'Test',
	});
}, askUserToolSchema);

const createAskUserInputTool = (from: string, fromName: string, recipients: string[], subject: string) => {
	return tool(async (input: any) => {
		const { question } = input;
		const result = await sendEmail({
			from,
			fromName,
			recipients,
			subject,
			text: question,
			html: `<p>${question}</p>`,
		});

		console.log(`Email sent to ${recipients.join(', ')} from ${from} with subject ${subject}`);
		console.log(JSON.stringify(result, null, 2));

		return undefined;
	}, askUserToolSchema);
};

export { askUserTool, createAskUserInputTool };
