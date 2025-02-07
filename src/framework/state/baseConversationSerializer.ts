import { Conversation } from './conversation';

export abstract class ConversationSerializer {
	abstract save(conversation: Conversation, expiration?: number): Promise<void>;
	abstract load(id: string): Promise<Conversation>;
}
