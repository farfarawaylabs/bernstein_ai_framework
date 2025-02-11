import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { WebResearcherAgent } from "@/agents/research/webResearcherAgent";
import { AI_MODELS } from "@/models/enums";

const researchAgentToolSchema: StructuredToolParams = {
	name: "research_agent",
	description:
		"Research a topic across the web and compile a detailed research report",
	schema: z.object({
		topic: z.string().describe("The topic to research"),
		questions: z.array(z.string()).describe(
			"The questions to focus the research on",
		),
		additional_instructions: z.string().optional().describe(
			"Any additional instructions to the researcher",
		),
	}),
};

function createResearchAgentTool(
	model: AI_MODELS = AI_MODELS.CHATGPT4O,
	taskId?: string,
) {
	return tool(async (input: any) => {
		console.log(
			`ResearchAgentTool initiated with the following input: ${
				JSON.stringify(input, null, 2)
			}`,
		);
		const { topic, questions, additional_instructions } = input;

		const researchAgent = new WebResearcherAgent({
			topic: topic,
			questions: questions,
			additional_instructions: additional_instructions,
			model: model,
			taskId: taskId,
		});

		const researchReport = await researchAgent.run();

		return researchReport;
	}, researchAgentToolSchema);
}

const researchAgentTool = createResearchAgentTool(AI_MODELS.CHATGPT4O);

export { createResearchAgentTool, researchAgentTool };
