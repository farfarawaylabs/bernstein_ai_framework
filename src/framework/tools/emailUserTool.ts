import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { sendEmail } from '@/services/sendgrid';

const askUserToolSchema: StructuredToolParams = {
	name: 'ask_user',
	description: 'Ask the user for input',
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

const createAskUserTook = (from: string, fromName: string, recipients: string[], subject: string) => {
	return tool(async (input: any) => {
		const { question } = input;
		const result = await sendEmail({
			from,
			fromName,
			recipients,
			subject,
			text: question,
		});

		return result;
	}, askUserToolSchema);
};

export { askUserTool, createAskUserTook };
