import { getToolCallsForTask } from "@/bl/tasks/getToolCallsForTask";
import { getConversation } from "@/dl/conversations/dl_getConversation";
import { getNumberOfTasksPerUserPerDay } from "@/dl/tasks/getNumberOfTasksPerUserPerDay";
import { Conductor } from "@/framework/conductor";
import { Operator } from "@/framework/operators";
import { Conversation } from "@/framework/state/conversation";
import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { getResearchToolsPackage } from "@/framework/tools/toolPackages";
import { getWritingToolsPackage } from "@/framework/tools/toolPackages";
import { createResearchSectionWriterTool } from "@/framework/tools/writing/research/researchSectionWriterTool";
import { AI_MODELS } from "@/models/enums";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.post("/test", async (c) => {
	console.log("test");
	//const body = await c.req.json();

	const x = await getToolCallsForTask(
		"44b88a70-fee1-4f4e-ba50-4c7567a4573b",
	);

	return c.json({ response: x });
});

app.post("/continueConversation", async (c) => {
	const body = await c.req.json();
	const conversation = await getConversation(body.conversationId);

	const operator = new Operator({
		tools: {
			...getResearchToolsPackage(),
			research_section_writer_agent: createResearchSectionWriterTool(
				AI_MODELS.CHATGPT4O,
			),
		},
	});

	const conductor = new Conductor({
		operator: operator,
		defaultModel: AI_MODELS.CHATGPT4O,
		stateSerializer: new SupabaseSerializer(
			"c00b2969-1333-411a-bd95-d8653eb4427c",
		),
		conversationId: conversation.id,
		hooks: {
			onConversationStopped: async (conversation: Conversation) => {},
		},
	});
	const response = await conductor.conduct();

	return c.json({ response });
});

// app.post('/writeBlogPost', async (c) => {
// 	const body = await c.req.json();
// 	const blogPostWriter = new BlogPostWriter(body.topic);
// 	const response = await blogPostWriter.run();
// 	//return c.json({ response: 'test' });
// 	return c.json({ response, conversation: blogPostWriter.getConductor()?.getConversation() });
// });

// app.post('/withUserInput', async (c) => {
// 	const body = await c.req.json();
// 	const operator = new Operator({
// 		ask_user_input: createAskUserInputTool(
// 			'x@bernstein.deathstarlabs.com',
// 			'Bernstein AI',
// 			['shahar@farfarawaylabs.com'],
// 			'Bernstein AI needs your input'
// 		),
// 	});

// 	const conductor = new Conductor({
// 		operator: operator,
// 		defaultModel: AI_MODELS.CHATGPT4O,
// 		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 1),
// 	});

// 	await conductor.startConversation();

// 	const systemMessage = new SystemMessage(
// 		'You are a helpful assistant that can answer questions and help with tasks. If you need to ask the user for input, use the provided tools to do so.'
// 	);
// 	const firstMessage = new HumanMessage(body.prompt);

// 	await conductor.addMessages([systemMessage, firstMessage]);

// 	const response = await conductor.conduct();

// 	const currentStep = await conductor.getCurrentStep();

// 	if (currentStep === ConversationSteps.WaitingForUserInput) {
// 		await cacheConversationIdForEmail('shahar@farfarawaylabs.com', conductor.conversation!.id);
// 	}

// 	return c.json({ response });
// });

// app.post('/runPrompt', async (c) => {
// 	const body = await c.req.json();

// 	const myWeatherTool = createWweatherTool('Bon Jour ');
// 	const operator = new Operator({
// 		get_current_weather: myWeatherTool,
// 	});

// 	const conductor = new Conductor({
// 		operator: operator,
// 		defaultModel: AI_MODELS.CHATGPT4O,
// 		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
// 	});

// 	await conductor.startConversation();

// 	const firstMessage = new HumanMessage(body.prompt);

// 	await conductor.addMessages([firstMessage]);

// 	const response = await conductor.conduct();

// 	return c.json({ response });
// });

// app.post('/testConduct', async (c) => {
// 	const operator = new Operator({
// 		get_current_weather: weatherTool,
// 	});

// 	const conductor = new Conductor({
// 		operator: operator,
// 		defaultModel: AI_MODELS.CHATGPT4O,
// 		stateSerializer: new KVStoreConversationSerializer(60 * 60 * 24 * 2),
// 	});

// 	await conductor.startConversation();

// 	const firstMessage = new HumanMessage('When did Harrison Ford was born?');

// 	await conductor.addMessages([firstMessage]);

// 	const response = await conductor.runNextStep();

// 	const secondMessage = new HumanMessage('And where he was born?');

// 	await conductor.addMessages([secondMessage]);

// 	const response2 = await conductor.runNextStep();

// 	const thirdMessage = new HumanMessage("And what's the current weather in there?");

// 	await conductor.addMessages([thirdMessage]);

// 	const response3 = await conductor.runNextStep();
// 	const response4 = await conductor.runNextStep();
// 	const response5 = await conductor.runNextStep();
// 	const response6 = await conductor.runNextStep();

// 	const conversation = await conductor.getConversation();

// 	return c.json({ conversation });
// });

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
