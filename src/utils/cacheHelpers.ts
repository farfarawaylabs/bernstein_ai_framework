import Environment from './environment';

export async function cacheConversationIdForEmail(email: string, conversationId: string) {
	await Environment.KV_CACHE.put(`email-${email}`, conversationId);
}

export async function getConversationIdFromEmail(email: string) {
	return await Environment.KV_CACHE.get(`email-${email}`);
}
