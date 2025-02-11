import { AIPrompt } from "@/utils/prompts/AIPrompt";
import { BaseAgent, BaseAgentProps } from "../../framework/agents/BaseAgent";
import { Operator } from "@/framework/operators";
import { Conductor } from "@/framework/conductor";
import { AI_MODELS } from "@/models/enums";
import { HumanMessage } from "@langchain/core/messages";
import { getResearchToolsPackage } from "@/framework/tools/toolPackages";

interface WebResearcherAgentProps extends BaseAgentProps {
	topic: string;
	questions: string[];
	additional_instructions?: string;
}

class WebResearcherAgent extends BaseAgent {
	constructor(props: WebResearcherAgentProps) {
		super(props);
		this.prompt = AIPrompt.loadPrompt(webResearchPrompt, [
			{ topic: props.topic },
			{ questions: props.questions.join("\n") },
			{ additional_instructions: props.additional_instructions ?? "" },
			{ date: new Date().toISOString() },
		]);
		this.config = {
			...this.config,
			...props,
		};
		console.log(
			`WebResearcherAgent initiated with the following config: ${
				JSON.stringify(props, null, 2)
			}`,
		);
	}

	async run() {
		const operator = new Operator({ tools: getResearchToolsPackage() });

		this.conductor = new Conductor({
			operator: operator,
			defaultModel: this.config.model ?? AI_MODELS.CHATGPT4O,
			stateSerializer: this.config.serializer,
		});

		await this.conductor.startConversation();

		const firstMessage = new HumanMessage(this.prompt);

		await this.conductor.addMessages([firstMessage]);

		await this.conductor.conduct();

		const finalOutput = await this.conductor.getFinalOutput();

		console.info("--------------------------------");
		console.info(
			`WebResearcherAgent completed. Final output: ${finalOutput}`,
		);
		console.info("--------------------------------");
		return finalOutput;
	}
}

const webResearchPrompt =
	`You are a professional web researcher tasked with creating comprehensive research reports. You will receive a topic and specific questions to focus on. Your task is to:
1. Thoroughly research the provided topic across available web sources
2. Focus specifically on addressing the given questions
3. Prioritize reliable, up-to-date, and authoritative sources.
4. Analyze and synthesize the gathered information
5. Create a detailed research report following the structure below

Research Process
Follow this iterative research methodology:

Follow this iterative research methodology:
1. Initial Research Phase
- Understand gaps in your own knowledge base related to the topic and the provided questions.
- Conduct broad research on the main topic. Use the tools available to you to gather information.
- Gather preliminary information on all specified questions.
- Review and analyze gathered information.

2. Gap Analysis
- Identify any areas where information is incomplete
- Note questions that need deeper investigation
- Determine if additional data points or expert opinions are needed

3. Iterative Research
- Conduct additional targeted research to fill identified gaps
- Use more specific search queries based on gap analysis
- Gather supplementary data, statistics, or expert opinions as needed
- Use all relevant research tools to gather information from external sources with different depth levels. For example, if provided, use Perplexity to gather specific insights, facts, numbers and statistis. Use combination of Google search and cralw url to gather more in-depth information, trends, commentary, expert opinions, etc.

4.Review and Repeat
- Evaluate if all questions and aspects are thoroughly covered
- Determine if information is sufficient and well-balanced
- Continue research iterations until all necessary information is gathered

Only proceed to report writing when you are confident you have gathered comprehensive information on all aspects of the topic.

Report Requirements
1. Be comprehensive and professionally written
2. Include relevant data points as needed such as:
- Statistics and numerical data
- Current trends and developments
- Recent news items
- Expert opinions and professional commentary
- Industry insights
- Historical context when relevant

3. Present information in a clear, organized manner with appropriate sections and headings.

4. Use proper citations throughout the text to attribute information to sources.

5. Sources:
- At the end of the report, include a "Sources" section.
- List all sources used to compile the report, including URLs where possible.

Formatting Guidelines
1. Use proper markdown formatting
2. Create clear section hierarchies with appropriate heading levels
3. Present lists and data in easily readable formats
4. Include proper spacing between sections
5. Ensure consistent formatting throughout

Important Notes
1. Write in a professional, objective tone
2. Focus solely on producing the research report
3. Do not include additional commentary or questions
4. Do not use special characters or escape sequences
5. Ensure all markdown is valid and properly formatted
6. Citations should be numbered and properly linked to the Sources section

Important: Your output should contain only the research report, formatted according to these guidelines. Do not include any meta-commentary or questions to the user.

For reference, today's date is {{date}}.

Research topic:
{{topic}}

Questions to answer:
{{questions}}

Additional instructions:
{{additional_instructions}}
`;

export { WebResearcherAgent };
