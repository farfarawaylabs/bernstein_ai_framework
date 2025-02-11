import { Conversation } from "./conversation";

/**
 * Abstract class representing a serializer for conversation objects.
 * This class provides the interface for saving and loading conversations,
 * potentially with an expiration time for the saved data.
 */
export abstract class ConversationSerializer {
	/**
	 * Saves a conversation object.
	 * @param conversation - The conversation object to be saved.
	 * @param expiration - Optional expiration time in seconds for the saved conversation.
	 * @returns A promise that resolves when the conversation is successfully saved.
	 */
	abstract save(
		conversation: Conversation,
		expiration?: number,
	): Promise<void>;

	/**
	 * Loads a conversation object by its identifier.
	 * @param id - The unique identifier of the conversation to be loaded.
	 * @returns A promise that resolves to the loaded conversation object.
	 */
	abstract load(id: string): Promise<Conversation>;
}
