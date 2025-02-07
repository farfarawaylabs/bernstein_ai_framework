import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { askQuestion } from '@/services/perplexity';
import { createTool } from './baseTool';

const aksPerplexityToolSchema: StructuredToolParams = {
	name: 'aks_question_from_web',
	description:
		'Perplexity is a tool that can be used to ask questions and get responses from the internet. The tool crawls the web and compile the results into a single response.',
	schema: z.object({
		question: z.string().describe('The question to ask the internet'),
	}),
};

const aksPerplexityTool = () => {
	return createTool(
		async (input: any) => {
			const { question } = input;
			const result = await askQuestion(question);
			return result;
		},
		aksPerplexityToolSchema,
		true
	);
};

// const aksPerplexityTool = tool(async (input: any) => {
// 	const { question } = input;
// 	const result = await askQuestion(question);
// 	return result;
// }, aksPerplexityToolSchema);

export { aksPerplexityTool };
