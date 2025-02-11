import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { AI_MODELS } from "@/models/enums";
import GeneralWriterAgent from "@/agents/writing/generic/GenericWriterAgent";

/**
 * Schema definition for the General Writer Agent Tool.
 * This schema outlines the expected input structure for the tool,
 * including detailed writing instructions and tone/style guidelines.
 */
const generalWriterAgentToolSchema: StructuredToolParams = {
	name: "writer_agent",
	description:
		"An agent that writes a piece of content based on the instructions provided (instructions should be highly detailed)",
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

/**
 * Creates a General Writer Tool using the specified AI model.
 * This function initializes the tool with a given model and returns
 * a function that processes input to generate written content.
 *
 * @param model - The AI model to be used for generating content.
 * @returns A tool function that takes input and returns generated content.
 */
function createGeneralWriterTool(model: AI_MODELS, taskId?: string) {
	return tool(async (input: any) => {
		console.log(
			`GeneralWriterAgentTool initiated with the following input: ${
				JSON.stringify(input, null, 2)
			}`,
		);
		const { writing_instructions, tone_and_style_guidelines } = input;

		// Initialize the General Writer Agent with the provided instructions and model
		const researchAgent = new GeneralWriterAgent({
			writingInstructions: writing_instructions,
			toneAndStyleGuidelines: tone_and_style_guidelines,
			model: model,
			taskId: taskId,
		});

		// Execute the agent to generate the writing content
		const researchReport = await researchAgent.run();

		return researchReport;
	}, generalWriterAgentToolSchema);
}

// Instantiate the General Writer Tool with a specific AI model
const generalWriterTool = createGeneralWriterTool(AI_MODELS.CHATGPT4O);

// Export the tool creation function and the instantiated tool
export { createGeneralWriterTool, generalWriterTool };
