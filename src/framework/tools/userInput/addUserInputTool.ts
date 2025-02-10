import { StructuredToolParams, tool } from '@langchain/core/tools';
import { z } from 'zod';

const addUserInputToolSchema: StructuredToolParams = {
	name: 'add_user_input',
	description: 'Use internally by conductor to add back user input to the conversation',
	schema: z.object({
		input: z.string().describe('The user input to add to the conversation'),
		toolCallId: z.string().describe('The tool call id we return the user input to'),
	}),
};

const addUserInputTool = tool(async (input: any) => {
	return input.input;
}, addUserInputToolSchema);

export { addUserInputTool };
