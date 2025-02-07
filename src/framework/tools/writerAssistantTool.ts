import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { AIPrompt } from '@/utils/prompts/AIPrompt';
import { Operator } from '../operators';
import { aksPerplexityTool } from './aksPerpelxityTool';
import { googleSearchTool } from './googleSearchTool';
import { crawlGoogleShoppingTool } from './crawlGoogleShoppingTool';
import { crawlUrlTool } from './crawlurlTool';
import { Conductor } from '../conductor';
import { AI_MODELS } from '@/models/enums';
import { KVStoreConversationSerializer } from '../state/KVSerializer';
import { HumanMessage } from '@langchain/core/messages';

const writerAssistantToolSchema: StructuredToolParams = {
	name: 'writer_assistant',
	description: 'Write the content for the specified chapter.',
	schema: z.object({
		topic: z.string().describe('The general topic to write about'),
		chapter_title: z.string().describe('The title of the chapter to write about'),
		research: z.string().describe('The research data to write about, including citations'),
		additional_instructions: z.string().describe('Additional instructions for the writer including what to focus on'),
	}),
};

const focusedResearchPrompt = `
Role: You are the Writer. Your task is to produce well-researched, high-quality written content for a specific section or chapter of a research report.
	•	You may perform additional research by using any of the available tools (e.g., ask_question_from_web, google_search, crawl_url, conduct_research) if you need more information.

	Instructions:
	1.	Receive the Section Assignment:
	•	You will be given instructions for a single section or chapter of a larger research report, along with any relevant context or data from previous research.
	•	This assignment will specify exactly what the section should cover.

	2.	Perform Additional Research if Needed:
	•	If there are gaps in your knowledge or missing details, you may use research tools (like ask_question_from_web, google_search, crawl_url, or conduct_research).
	•	Your goal is to gather enough data, statistics, and expert opinions to write a comprehensive, accurate section.

	3.	Write the Assigned Section:
	•	Make the content relatable by providing practical examples or everyday parallels.
	•	Lean into insights and lessons learned—offer valuable takeaways where appropriate.
	•	You may organize information with bullet points, short paragraphs, or numbered lists, ensuring each idea is digestible and can stand on its own.

	4.	No Further Delegation:
	•	You cannot pass writing tasks to another tool. You alone are responsible for composing the text for this section.

	5.	Return the Completed Draft:
	•	Once you finish writing the assigned section, return the drafted text in a clear, coherent format.
	•	If you did additional research, include the citations in the text.
	•	If no further instructions are given, finalize and provide the text.
	•	provide the completed draft in a valid markdown format.

	Behavior Guidelines:
	•	Stay on Task: Only write content relevant to the assigned section.
	•	Accuracy & Depth: Incorporate factual details, expert commentary, data, and statistics when possible.
	•	Personal & Humble Tone: Write as though you’re sharing insights you’ve gained rather than dictating facts from a distance.
	•	No Additional Questions to the User: Do not ask the user for more clarification; rely on your own research tools to fill knowledge gaps.

	Chapter Title: {{chapter_title}}
	Topic: {{topic}}
	Additional Instructions: {{additional_instructions}}
	provided research: {{research}}

Today's Date in case you need it: {{date}}
`;

const writerAssistantTool = tool(async (input: any) => {
	const { topic, chapter_title, research, additional_instructions } = input;
	console.log(`WriterAssistantTool: Writing with the following inputs: ${JSON.stringify(input)}`);

	const prompt = AIPrompt.loadPrompt(focusedResearchPrompt, [
		{ topic: topic },
		{ chapter_title: chapter_title },
		{ research: research },
		{ additional_instructions: additional_instructions },
		{ date: new Date().toISOString() },
	]);

	const operator = new Operator({
		ask_question_from_web: aksPerplexityTool,
		google_search: googleSearchTool,
		crawl_url: crawlUrlTool,
		crawl_google_shopping: crawlGoogleShoppingTool,
	});

	const conductor = new Conductor({
		operator: operator,
		defaultModel: AI_MODELS.CHATGPT4O,
		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
		retryPlan: {
			numOfRetries: 1,
			retryDelayInSeconds: 1,
		},
	});

	await conductor.startConversation();

	const firstMessage = new HumanMessage(prompt);

	await conductor.addMessages([firstMessage]);

	const response = await conductor.conduct();

	const finalWriting = response?.getLastMessage().content;

	return { writingResults: finalWriting };
}, writerAssistantToolSchema);

export { writerAssistantTool };
