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

const conductResearchToolSchema: StructuredToolParams = {
	name: 'conduct_research',
	description: 'Conduct a research on a specified topic using the internet and focus on answering specific questions about the topic',
	schema: z.object({
		topic: z.string().describe('The general topic to conduct research on'),
		questions: z.array(z.string()).describe('The specific questions to answer about the topic'),
		additional_instructions: z.string().describe('Additional instructions for the research'),
	}),
};

const focusedResearchPrompt = `
You are assigned to conduct detailed research and write a comprehensive section on the following topic: {{topic}}.

Your Objectives:
	1.	Answer Specific Questions: Focus on answering the following questions in depth:
	{{questions}}
(Add more as provided)
	2.	Follow Additional Instructions:
	{{additional_instructions}}

Research Tools Available:
	•	ask_question_from_web: Use this to find precise answers, statistics, and specific data points.
	•	google_search: Perform broad searches to identify key articles, research papers, and credible sources related to the topic.
	•	crawl_url: Use this to extract detailed information from relevant webpages when needed.

Guidelines:
	1.	Depth Over Breadth: Your research should be thorough and detailed, ensuring each question is answered with depth and clarity.
	2.	Source Credibility: Prioritize reliable and up-to-date sources (academic papers, official reports, reputable news outlets).
	3.	Citations: Clearly cite sources for all facts, data, and direct quotes.
	4.	Clarity and Structure: Organize your findings logically, ensuring the section flows smoothly and is easy to understand.

Deliverable:

Provide a well-structured, detailed write-up covering all questions and incorporating relevant data, examples, and citations.
`;

const conductResearchTool = tool(async (input: any) => {
	const { topic, questions, additional_instructions } = input;
	console.log(`ConductResearchTool: Conducting research with the following inputs: ${JSON.stringify(input)}`);

	const prompt = AIPrompt.loadPrompt(focusedResearchPrompt, [
		{ topic: topic },
		{ questions: questions.join('\n') },
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

	const finalResearch = response?.getLastMessage().content;

	return { researchResults: finalResearch };
}, conductResearchToolSchema);

export { conductResearchTool };
