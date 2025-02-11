import Environment from "./environment";

/**
 * Caches the conversation ID associated with a given email.
 *
 * @param email - The email address to associate with the conversation ID.
 * @param conversationId - The conversation ID to cache.
 * @returns A promise that resolves when the conversation ID is successfully cached.
 */
export async function cacheConversationIdForEmail(
	email: string,
	conversationId: string,
) {
	await Environment.KV_CACHE.put(`email-${email}`, conversationId);
}

/**
 * Retrieves the conversation ID associated with a given email.
 *
 * @param email - The email address whose associated conversation ID is to be retrieved.
 * @returns A promise that resolves to the conversation ID if found, or null if not found.
 */
export async function getConversationIdFromEmail(email: string) {
	return await Environment.KV_CACHE.get(`email-${email}`);
}
