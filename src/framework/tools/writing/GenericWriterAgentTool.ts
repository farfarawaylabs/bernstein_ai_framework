import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { AI_MODELS } from "@/models/enums";
import GeneralWriterAgent from "@/agents/writing/generic/GenericWriterAgent";

const generalWriterAgentToolSchema: StructuredToolParams = {
	name: "writer_agent",
	description:
		"An agent that writes a piece of content based on the instructions provided (insturctions should be highly detailed)",
	schema: z.object({
		writing_instructions: z
			.string()
			.describe(
				"Clear and detailed directives on what the agent should write, including specific focus areas, and context about where this piece fits into a larger document (if applicable). Provide also instructions on depth level needed for the content.",
			),
		tone_and_style_guidelines: z
			.string()
			.describe(
				"Specific guidance on the tone (e.g., formal, conversational) and writing style (e.g., narrative, analytical, humorous, etc) ",
			),
	}),
};

function createGeneralWriterTool(model: AI_MODELS) {
	return tool(async (input: any) => {
		console.log(
			`GeneralWriterAgentTool initiated with the following input: ${
				JSON.stringify(input, null, 2)
			}`,
		);
		const { writing_instructions, tone_and_style_guidelines } = input;

		const researchAgent = new GeneralWriterAgent({
			writingInstructions: writing_instructions,
			toneAndStyleGuidelines: tone_and_style_guidelines,
			model: model,
		});

		const researchReport = await researchAgent.run();

		return researchReport;
	}, generalWriterAgentToolSchema);
}

const generalWriterTool = createGeneralWriterTool(AI_MODELS.CHATGPT4O);

export { createGeneralWriterTool, generalWriterTool };
