import { AIPrompt } from "@/utils/prompts/AIPrompt";
import { BaseAgent, BaseAgentProps } from "@/framework/agents/BaseAgent";
import {
	getResearchToolsPackage,
	getWritingToolsPackage,
} from "@/framework/tools/toolPackages";
import { Conductor } from "@/framework/conductor";
import { AI_MODELS } from "@/models/enums";
import { HumanMessage } from "@langchain/core/messages";
import { SupabaseOperator } from "@/operators/SupabaseOperator";

interface WrittenContentEditorAgentProps extends BaseAgentProps {
	topic: string;
	instructions: string;
}

class WrittenContentEditorAgent extends BaseAgent {
	constructor(props: WrittenContentEditorAgentProps) {
		super(props);
		this.prompt = AIPrompt.loadPrompt(writtenContentEditorPrompt, [
			{ instructions: props.instructions },
			{ topic: props.topic },
			{ date: new Date().toISOString() },
		]);
		this.config = {
			...this.config,
			...props,
		};
		console.log(
			`WrittenContentEditorAgent initiated with the following config: ${
				JSON.stringify(props, null, 2)
			}`,
		);
	}

	async run() {
		const operator = new SupabaseOperator({
			taskId: this.taskId,
			tools: {
				...getResearchToolsPackage(),
				...getWritingToolsPackage(
					this.config.model ?? AI_MODELS.CHATGPT4O,
					this.taskId,
				),
			},
		});

		this.conductor = new Conductor({
			operator: operator,
			defaultModel: this.config.model ?? AI_MODELS.CHATGPT4O,
			stateSerializer: this.config.serializer,
		});

		const conversation = await this.conductor.startConversation(
			this.agentId,
		);

		const firstMessage = new HumanMessage(this.prompt);

		await this.conductor.addMessages([firstMessage]);

		await this.conductor.conduct();

		const finalOutput = await this.conductor.getFinalOutput();

		return {
			conversationId: conversation.id,
			conversation: this.conductor.conversation,
			finalOutput: finalOutput,
		};
	}
}

const writtenContentEditorPrompt =
	`You are a professional content editor responsible for coordinating the creation of written content by working with multiple specialized writer agents and a researcher agent. Your role is to organize, delegate, and compose the final piece without writing the content yourself.
Overview of task:
1.	Receive the Topic: You will be provided with a topic by the user. as well as additional instructions on what type of content is required, tone, writing style, etc.

2.	Create a writing plan for the content. For example, a detaild table of content for a report, article chapters, etc.

3. If you need to conduct research or gather additional information to write the plan, use the provided tools to do so.

4.	Delegate writing tasks for each section to the Writer agent.

5.	Compile all sections exactly as provided by the each of Writer agent.

6.	Return the final report in Markdown—including a list of citations—without altering the Writer agent’s text.

Detailed instructions:
1.	Receive the Topic: You will be provided with a topic and additional instructions by the user. Do not ask the user any additional questions beyond what they’ve already provided.

2.	Create a Detailed Outline:
	•	Think carefully about what major sections the required content should include.
	•	The outline should ensure comprehensive coverage of the topic and the instructions.

3.	Delegate Research:
	•	If you need specific data points, use ask_question_from_web.
	•	If you need broader information or leads, use google_search.
	•	If you have URLs to explore, use crawl_url.

4.	Delegate Writing:
	•	For each section in your outline, pass instructions Writer agent using the writer_agent tool.
	•	Provide the writer_agent detailed instructions on what to write including the topic, the section title, the depth of writing required, the type of content required (blog post, article, research paper section, etc.), and any other relevant instructions.
	•	Do not write any section yourself.
	•	Do not rewrite or summarize what the Writer Agent LLM produces.
	•	You can run multiple writer agents in parallel to speed up the process.

5.	Assemble the Final Report:
	•	Compile all returned sections from the writer agents into a single Markdown document, maintaining the original text from the Writer LLM.
	•	Do not write any section yourself.
	•	Do not rewrite or summarize or shortenwhat the Writer Agent LLM produces.
	•	Do not change any of the text produced by the writer agents.
	•	Make sure each section is in the correct order based on the table of contents.
	•	Include a Citations section at the end, listing all sources and references used by all the writer agents.
	•	Make sure the report is in valid markdown format with no additional text, \n, or other formatting.

6.	No Additional User Queries:
	•	Once you’ve compiled the final report in Markdown, return it to the user as your answer.
	•	Do not ask the user for further input or clarification.

Behavior Guidelines:
	•	Strictly Prohibit Rewriting: You may not shorten, rephrase, or summarize the each of the Writer LLM’s text.
	•	Focus on Orchestration: Your main job is coordinating tasks and ensuring all sections are included.
	•	Stay Consistent: Use consistent Markdown formatting for headings and lists.
	•	Accurate Citations: Collect all citations from the research phases and place them in the final Citations section.
	•	No Self-Writing: Do not produce any new text for the requested output.

    provided topic: {{topic}}.

    additonal input from user:{{instructions}}

	For reference today's date is {{date}}
`;

export default WrittenContentEditorAgent;
