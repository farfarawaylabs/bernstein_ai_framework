import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { AI_MODELS } from "@/models/enums";
import ResearchReportSectionWriterAgent from "@/agents/writing/researchReports/ResearchReportSectionWriterAgent";

/**
 * Schema for the Research Section Writer Tool.
 * This schema defines the structure of the input parameters required by the tool.
 *
 * @property {string} writing_instructions - Detailed directives on what the agent should write.
 * @property {string} tone_and_style_guidelines - Specific guidance on the tone and writing style.
 */
const researchSectionWriterToolSchema: StructuredToolParams = {
    name: "research_section_writer_agent",
    description:
        "An agent that writes a section of a research report based on the instructions provided (instructions should be highly detailed)",
    schema: z.object({
        writing_instructions: z
            .string()
            .describe(
                "Clear and detailed directives on what the agent should write, including specific focus areas, and context about where this piece fits into a larger research report. Provide also instructions on depth level needed for the content.",
            ),
        tone_and_style_guidelines: z
            .string()
            .describe(
                "Specific guidance on the tone (e.g., formal, conversational) and writing style (e.g., narrative, analytical, humorous, etc) ",
            ),
    }),
};

/**
 * Creates a Research Section Writer Tool.
 *
 * This function initializes a tool that uses a specified AI model to generate a section of a research report.
 *
 * @param {AI_MODELS} model - The AI model to be used for generating the research report section.
 * @returns {Function} A tool function that processes input and returns a generated research report section.
 */
function createResearchSectionWriterTool(model: AI_MODELS, taskId?: string) {
    return tool(async (input: any) => {
        console.log(
            `ResearchSectionWriterTool initiated with the following input: ${
                JSON.stringify(input, null, 2)
            }`,
        );
        const { writing_instructions, tone_and_style_guidelines } = input;

        const researchAgent = new ResearchReportSectionWriterAgent({
            taskId: taskId,
            writingInstructions: writing_instructions,
            toneAndStyleGuidelines: tone_and_style_guidelines,
            model: model,
        });

        const researchReport = await researchAgent.run();

        return researchReport;
    }, researchSectionWriterToolSchema);
}

/**
 * An instance of the Research Section Writer Tool using the CHATGPT4O model.
 *
 * This tool can be used to generate sections of research reports with specified instructions and style guidelines.
 */
const researchSectionWriterTool = createResearchSectionWriterTool(
    AI_MODELS.CHATGPT4O,
);

export { createResearchSectionWriterTool, researchSectionWriterTool };
