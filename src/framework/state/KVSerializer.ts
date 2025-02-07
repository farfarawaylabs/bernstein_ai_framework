import Environment from '@/utils/environment';
import { Conversation } from './conversation';
import { ConversationSerializer } from './baseConversationSerializer';

export class KVStoreConversationSerializer extends ConversationSerializer {
	defaultExpiration: number | undefined;

	constructor(defaultExpiration?: number) {
		super();
		this.defaultExpiration = defaultExpiration;
	}

	async save(conversation: Conversation): Promise<void> {
		await Environment.KV_CACHE.put(
			`conversation-${conversation.id}`,
			JSON.stringify(conversation.serializeState()),
			this.defaultExpiration
				? {
						expirationTtl: this.defaultExpiration,
				  }
				: {}
		);
	}

	async load(id: string): Promise<Conversation> {
		const savedJson = await Environment.KV_CACHE.get(`conversation-${id}`);
		if (!savedJson) {
			throw new Error(`Conversation with id ${id} not found`);
		}
		const saved = JSON.parse(savedJson);
		return Conversation.deserializeConversationState(saved);
	}
}
