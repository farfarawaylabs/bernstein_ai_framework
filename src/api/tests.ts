import { Conductor } from '@/framework/conductor';
import { KVStoreConversationSerializer } from '@/framework/state/KVSerializer';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AI_MODELS } from '@/models/enums';
import { Hono } from 'hono';
import { weatherTool } from '@/framework/tools/demoTools';
import { Operator } from '@/framework/operators';
import { askUserTool, createAskUserInputTool } from '@/framework/tools/emailUserTool';
import { aksPerplexityTool } from '@/framework/tools/aksPerpelxityTool';
import BlogPostWriter from '@/agents/writers/blogPostWriter';
import { ConversationSteps } from '@/framework/state/conversation';
import { cacheConversationIdForEmail } from '@/utils/cacheHelpers';
import { addUserInputTool } from '@/framework/tools/addUserInputTool';
import ResearchWriter from '@/agents/writers/researchWriter';
const app = new Hono<{ Bindings: Env }>();

app.post('/writeResearchReport', async (c) => {
	const body = await c.req.json();
	const researchWriter = new ResearchWriter(body.topic, body.additional_instructions);
	const response = await researchWriter.run();

	return c.json({ response, conversation: researchWriter.getConductor()?.getConversation() });
});

app.post('/writeBlogPost', async (c) => {
	const body = await c.req.json();
	const blogPostWriter = new BlogPostWriter(body.topic);
	const response = await blogPostWriter.run();
	//return c.json({ response: 'test' });
	return c.json({ response, conversation: blogPostWriter.getConductor()?.getConversation() });
});

app.post('/withUserInput', async (c) => {
	const body = await c.req.json();
	const operator = new Operator({
		ask_user_input: createAskUserInputTool(
			'x@bernstein.deathstarlabs.com',
			'Bernstein AI',
			['shahar@farfarawaylabs.com'],
			'Bernstein AI needs your input'
		),
	});

	const conductor = new Conductor({
		operator: operator,
		defaultModel: AI_MODELS.CHATGPT4O,
		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 1),
	});

	await conductor.startConversation();

	const systemMessage = new SystemMessage(
		'You are a helpful assistant that can answer questions and help with tasks. If you need to ask the user for input, use the provided tools to do so.'
	);
	const firstMessage = new HumanMessage(body.prompt);

	await conductor.addMessages([systemMessage, firstMessage]);

	const response = await conductor.conduct();

	const currentStep = await conductor.getCurrentStep();

	if (currentStep === ConversationSteps.WaitingForUserInput) {
		await cacheConversationIdForEmail('shahar@farfarawaylabs.com', conductor.conversation!.id);
	}

	return c.json({ response });
});

app.post('/runPrompt', async (c) => {
	const body = await c.req.json();

	const operator = new Operator({
		get_current_weather: weatherTool,
	});

	const conductor = new Conductor({
		operator: operator,
		defaultModel: AI_MODELS.CHATGPT4O,
		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
	});

	await conductor.startConversation();

	const firstMessage = new HumanMessage(body.prompt);

	await conductor.addMessages([firstMessage]);

	const response = await conductor.conduct();

	return c.json({ response });
});

app.post('/testConduct', async (c) => {
	const operator = new Operator({
		get_current_weather: weatherTool,
	});

	const conductor = new Conductor({
		operator: operator,
		defaultModel: AI_MODELS.CHATGPT4O,
		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
	});

	await conductor.startConversation();

	const firstMessage = new HumanMessage('When did Harrison Ford was born?');

	await conductor.addMessages([firstMessage]);

	const response = await conductor.runNextStep();

	const secondMessage = new HumanMessage('And where he was born?');

	await conductor.addMessages([secondMessage]);

	const response2 = await conductor.runNextStep();

	const thirdMessage = new HumanMessage("And what's the current weather in there?");

	await conductor.addMessages([thirdMessage]);

	const response3 = await conductor.runNextStep();
	const response4 = await conductor.runNextStep();
	const response5 = await conductor.runNextStep();
	const response6 = await conductor.runNextStep();

	const conversation = await conductor.getConversation();

	return c.json({ conversation });
});

// app.post('/firstTask', async (c) => {
// 	const body = await c.req.json();

// 	const operator = new Operator({
// 		get_current_weather: weatherTool,
// 	});

// 	const conductor = new Conductor(new KVStoreConversationSerializer(60 * 60 * 24 * 2), operator);
// 	const conversation = await conductor.startConversation();

// 	const firstTask = buildTask(async (inputs) => {
// 		const model = getAIModel(AI_MODELS.CHATGPT4O);
// 		const response = await model.invoke(inputs.prompt);
// 		return [response];
// 	});
// 	const messages = await conductor.continueConversation(firstTask, { prompt: body.prompt });

// 	return c.json({ conversation, messages });
// });

// app.post('/moreTask', async (c) => {
// 	const body = await c.req.json();
// 	const operator = new Operator({
// 		get_current_weather: weatherTool,
// 	});

// 	const conductor = new Conductor(new KVStoreConversationSerializer(60 * 60 * 24 * 2), operator, body.conversationId);

// 	const secondTask = buildTask(async (inputs, config) => {
// 		const model = getAIModel(AI_MODELS.CHATGPT4O);
// 		const modelWithTools = model.bindTools(config!.tools!);
// 		const response = await modelWithTools.invoke([...config!.previousMessages!, new HumanMessage(inputs.prompt)]);

// 		return [response];
// 	});
// 	const messages = await conductor.continueConversation(secondTask, { prompt: body.prompt });

// 	const conversation = await conductor.getConversation();

// 	return c.json({ messages, conversation });
// });

export default app;
