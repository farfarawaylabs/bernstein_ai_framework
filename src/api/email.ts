import { Conductor } from '@/framework/conductor';
import { Operator } from '@/framework/operators';
import { Conversation } from '@/framework/state/conversation';
import { KVStoreConversationSerializer } from '@/framework/state/KVSerializer';
import { createAskUserInputTool } from '@/framework/tools/userInput/emailUserTool';
import { AI_MODELS } from '@/models/enums';
import { getConversationIdFromEmail } from '@/utils/cacheHelpers';
import { extractEmail, extractUserReply } from '@/utils/emailHelpers';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.post('/incoming', async (c) => {
	console.log('Incoming email');
	const body = await c.req.formData();
	// body.forEach((value, key) => {
	// 	console.log('*****');
	// 	console.log(`${key}: ${value}`);
	// 	console.log('*****');
	// });

	const from = body.get('from');
	if (typeof from === 'string') {
		const email = extractEmail(from);
		if (email) {
			const conversationId = await getConversationIdFromEmail(email);

			const operator = new Operator({});

			const conductor = new Conductor({
				operator: operator,
				defaultModel: AI_MODELS.CHATGPT4O,
				stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 1),
				conversationId: conversationId!,
				hooks: {
					onConversationStopped: async (conversation: Conversation) => {},
				},
			});

			const emailBody = body.get('text');
			await conductor.loadConversation();
			const lastToolCall = conductor.conversation?.getLastToolCalls().find((toolCall) => toolCall.name === 'ask_user_input');

			conductor.addUserInputToConversation(extractUserReply(emailBody as string), lastToolCall!.id!);

			const response = await conductor.conduct();
			console.log('response: ', response);
		}
	}

	c.status(200);
	return c.body('processed');
});

export default app;
