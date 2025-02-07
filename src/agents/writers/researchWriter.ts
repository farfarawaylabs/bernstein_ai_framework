import { aksPerplexityTool } from '@/framework/tools/aksPerpelxityTool';
import { BaseAgent } from '../BaseAgent';
import { AIPrompt } from '@/utils/prompts/AIPrompt';
import { Operator } from '@/framework/operators';
import { Conductor } from '@/framework/conductor';
import { AI_MODELS } from '@/models/enums';
import { KVStoreConversationSerializer } from '@/framework/state/KVSerializer';
import { HumanMessage } from '@langchain/core/messages';
import writeResearchPrompt from '@/prompts/writing/writeResearchPrompt';
import { crawlUrlTool } from '@/framework/tools/crawlurlTool';
import { crawlGoogleShoppingTool } from '@/framework/tools/crawlGoogleShoppingTool';
import { googleSearchTool } from '@/framework/tools/googleSearchTool';
import { conductResearchTool } from '@/framework/tools/conductResearchTool';
import { writerAssistantTool } from '@/framework/tools/writerAssistantTool';

class ResearchWriter extends BaseAgent {
	constructor(topic: string, additional_instructions?: string) {
		super();
		this.prompt = AIPrompt.loadPrompt(writeResearchPrompt, [
			{ topic: topic },
			{ num_of_research_iterations: '8' },
			{ additional_instructions: additional_instructions || '' },
			{ date: new Date().toISOString() },
		]);
	}

	async run() {
		const operator = new Operator({
			ask_question_from_web: aksPerplexityTool,
			google_search: googleSearchTool,
			crawl_url: crawlUrlTool,
			crawl_google_shopping: crawlGoogleShoppingTool,
			conduct_research: conductResearchTool,
			writer_assistant: writerAssistantTool,
		});

		this.conductor = new Conductor({
			operator: operator,
			defaultModel: AI_MODELS.CHATGPT4O,
			stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
			retryPlan: {
				numOfRetries: 1,
				retryDelayInSeconds: 1,
			},
		});

		await this.conductor.startConversation();

		const firstMessage = new HumanMessage(this.prompt);

		await this.conductor.addMessages([firstMessage]);

		const response = await this.conductor.conduct();

		console.log(JSON.stringify(response, null, 2));
		return response;
	}
}

export default ResearchWriter;
