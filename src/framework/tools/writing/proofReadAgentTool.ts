import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { AI_MODELS } from '@/models/enums';
import ProofReadingAgent from '@/agents/writing/ProofreadingAgent';

const proofReadingAgentToolSchema: StructuredToolParams = {
	name: 'proof_reading_agent',
	description: 'Proofread a piece of content based on the instructions provided',
	schema: z.object({
		original_writing_instructions: z
			.string()
			.describe(
				'The original writing instructions given to the writer (what the writer was tasked in writing, the tone and style guidelines, etc)'
			),
		content_to_proofread: z.string().describe('The content to proofread'),
	}),
};

function createProofReadingAgentTool(model: AI_MODELS) {
	return tool(async (input: any) => {
		console.log(`ProofReadingAgentTool initiated with the following input: ${JSON.stringify(input, null, 2)}`);
		const { original_writing_instructions, content_to_proofread } = input;

		const proofReadingAgent = new ProofReadingAgent({
			instructions: original_writing_instructions,
			content: content_to_proofread,
			model: model,
		});

		const proofReadingReport = await proofReadingAgent.run();

		return proofReadingReport;
	}, proofReadingAgentToolSchema);
}

const proofReadingAgentTool = createProofReadingAgentTool(AI_MODELS.CHATGPT4O);

export { proofReadingAgentTool, createProofReadingAgentTool };
