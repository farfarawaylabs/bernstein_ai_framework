import { aksPerplexityTool } from '@/framework/tools/aksPerpelxityTool';
import { BaseAgent } from '../BaseAgent';
import { AIPrompt } from '@/utils/prompts/AIPrompt';
import { Operator } from '@/framework/operators';
import { Conductor } from '@/framework/conductor';
import { AI_MODELS } from '@/models/enums';
import { KVStoreConversationSerializer } from '@/framework/state/KVSerializer';
import { HumanMessage } from '@langchain/core/messages';
import writeBlogPostPrompt from '@/prompts/writing/writeBlogPostPrompt';

class BlogPostWriter extends BaseAgent {
	constructor(topic: string) {
		super();
		this.prompt = AIPrompt.loadPrompt(writeBlogPostPrompt, [{ topic: topic }, { num_of_research_iterations: '3' }]);
	}

	async run() {
		const operator = new Operator({
			aks_question_from_web: aksPerplexityTool,
		});

		this.conductor = new Conductor({
			operator: operator,
			defaultModel: AI_MODELS.CHATGPT4O,
			stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
		});

		await this.conductor.startConversation();

		const firstMessage = new HumanMessage(this.prompt);

		await this.conductor.addMessages([firstMessage]);

		const response = await this.conductor.conduct();

		return response;
	}
}

export default BlogPostWriter;
