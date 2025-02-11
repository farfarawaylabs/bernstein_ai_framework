import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { sendEmail } from "@/services/sendgrid";

/**
 * Schema for the ask user input tool.
 * Defines the structure of the input expected by the tool.
 */
const askUserToolSchema: StructuredToolParams = {
	name: "ask_user_input",
	description: "Use this tool to ask the user for input",
	schema: z.object({
		question: z.string().describe("The question to ask the user"),
	}),
};

/**
 * A tool to send an email asking the user a question.
 * This tool uses a predefined email configuration.
 *
 * @param input - The input object containing the question to ask the user.
 * @returns A promise that resolves when the email is sent.
 */
const askUserTool = tool(async (input: any) => {
	const { question } = input;
	const result = await sendEmail({
		from: "shahar@farfarawaylabs.com",
		fromName: "Bernstein AI",
		recipients: ["test@test.com"],
		subject: "Test",
		text: "Test",
	});
}, askUserToolSchema);

/**
 * Factory function to create a customized ask user input tool.
 * Allows specifying email details such as sender, recipients, and subject.
 *
 * @param from - The email address of the sender.
 * @param fromName - The name of the sender.
 * @param recipients - An array of recipient email addresses.
 * @param subject - The subject of the email.
 * @returns A tool function that sends an email with the specified configuration.
 */
const createAskUserInputTool = (
	from: string,
	fromName: string,
	recipients: string[],
	subject: string,
) => {
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

		return undefined;
	}, askUserToolSchema);
};

/**
 * Exports the predefined ask user tool and the factory function for creating customized tools.
 */
export { askUserTool, createAskUserInputTool };
