import Environment from "@/utils/environment";
import { Conversation } from "./conversation";
import { ConversationSerializer } from "./baseConversationSerializer";

/**
 * KVStoreConversationSerializer is a concrete implementation of the ConversationSerializer
 * that uses Cloudflare KV storage to persist and retrieve conversation states.
 */
export class KVStoreConversationSerializer extends ConversationSerializer {
	defaultExpiration: number | undefined;

	/**
	 * Constructs a new KVStoreConversationSerializer.
	 * @param defaultExpiration - Optional expiration time in seconds for the stored conversation.
	 */
	constructor(defaultExpiration?: number) {
		super();
		this.defaultExpiration = defaultExpiration;
	}

	/**
	 * Saves a conversation state to Cloudflare KV storage.
	 * @param conversation - The conversation object to be serialized and stored.
	 * @returns A promise that resolves when the conversation is successfully saved.
	 */
	async save(conversation: Conversation): Promise<void> {
		await Environment.KV_CACHE.put(
			`conversation-${conversation.id}`,
			JSON.stringify(conversation.serializeState()),
			this.defaultExpiration
				? {
					expirationTtl: this.defaultExpiration,
				}
				: {},
		);
	}

	/**
	 * Loads a conversation state from Cloudflare KV storage.
	 * @param id - The unique identifier of the conversation to be retrieved.
	 * @returns A promise that resolves to the deserialized conversation object.
	 * @throws An error if the conversation with the specified id is not found.
	 */
	async load(id: string): Promise<Conversation> {
		const savedJson = await Environment.KV_CACHE.get(`conversation-${id}`);
		if (!savedJson) {
			throw new Error(`Conversation with id ${id} not found`);
		}
		const saved = JSON.parse(savedJson);
		return Conversation.deserializeConversationState(saved);
	}
}
