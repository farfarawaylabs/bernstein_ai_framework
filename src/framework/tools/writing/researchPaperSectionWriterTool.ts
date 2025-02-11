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

/**
 * General Writer Agent Tool
 *
 * This tool utilizes the GeneralWriterAgent to generate content based on detailed instructions.
 * It is designed to assist in writing sections of research papers or other structured documents.
 *
 * @param {AI_MODELS} model - The AI model to be used for content generation.
 *
 * @returns {Function} - A tool function that processes input and returns generated content.
 *
 * Input Schema:
 * - writing_instructions: A string containing clear and detailed directives on what the agent should write.
 *   This includes specific focus areas and context about where this piece fits into a larger document.
 *   Instructions should also specify the depth level needed for the content.
 *
 * - tone_and_style_guidelines: A string providing specific guidance on the tone (e.g., formal, conversational)
 *   and writing style (e.g., narrative, analytical, humorous, etc).
 *
 * Usage:
 * The tool is initialized with a specific AI model and can be invoked with an input object containing
 * the required schema fields. It returns the generated content as a string.
 */
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
