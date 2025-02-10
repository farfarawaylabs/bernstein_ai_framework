import { Conductor } from '@/framework/conductor';
import { ConversationSerializer } from '@/framework/state/baseConversationSerializer';
import { KVStoreConversationSerializer } from '@/framework/state/KVSerializer';
import { AI_MODELS } from '@/models/enums';

export interface BaseAgentProps {
	model?: AI_MODELS;
	serializer?: ConversationSerializer;
}

export abstract class BaseAgent {
	agentId: string;
	protected prompt: string;
	protected conductor: Conductor | undefined;
	protected config: any;

	constructor(props: BaseAgentProps) {
		this.agentId = crypto.randomUUID();
		this.prompt = '';

		const { model = AI_MODELS.CHATGPT4O, serializer = new KVStoreConversationSerializer(60 * 60 * 24 * 1) } = props;

		this.config = { model, serializer };
	}

	getConductor() {
		return this.conductor;
	}

	abstract run(): Promise<any>;
}
