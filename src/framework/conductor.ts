import { BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { ConversationSerializer } from './state/baseConversationSerializer';
import { Conversation, ConversationSteps } from './state/conversation';
import { Operator } from './operators';
import { AI_MODELS } from '@/models/enums';
import { getAIModel } from '@/utils/aiHelpers';
import { addUserInputTool } from './tools/userInput/addUserInputTool';

interface ConductorRetryPlan {
	numOfRetries: number;
	retryDelayInSeconds: number;
}

interface ConductorHooks {
	onConversationStopped?: (conversation: Conversation) => void;
}

interface ConductorConfig {
	stateSerializer: ConversationSerializer;
	operator?: Operator;
	defaultModel?: AI_MODELS | undefined;
	conversationId?: string;
	retryPlan?: ConductorRetryPlan;
	hooks?: ConductorHooks | undefined;
}

class Conductor {
	stateSerializer: ConversationSerializer;
	conversationId: string | undefined;
	conversation: Conversation | undefined;
	operator: Operator | undefined;
	defaultModel: AI_MODELS | undefined;
	retryPlan: ConductorRetryPlan | undefined;
	hooks: ConductorHooks | undefined;

	constructor(config: ConductorConfig) {
		this.stateSerializer = config.stateSerializer;
		this.conversationId = config.conversationId;
		this.operator = config.operator;
		this.defaultModel = config.defaultModel;
		this.retryPlan = config.retryPlan || { numOfRetries: 3, retryDelayInSeconds: 10 };
		this.hooks = config.hooks;
	}

	private async executeNextStep() {
		console.log(`Conductor: Executing next step: ${this.conversation!.currentStep}`);

		switch (this.conversation!.currentStep) {
			case ConversationSteps.WaitingForLLMResponse:
			case ConversationSteps.ToolsResponseReceived:
				if (!this.defaultModel) {
					throw new Error('Default model not set');
				}

				const model = getAIModel(this.defaultModel);
				const modelWithTools = model.bindTools(this.operator!.getTools());

				const response = await modelWithTools.invoke(this.conversation!.messages);
				this.conversation!.addMessages([response]);
				await this.stateSerializer.save(this.conversation!);

				return response;
			case ConversationSteps.WaitingForToolsResponse:
				if (!this.operator) {
					throw new Error('Operator not set');
				}

				const toolCalls = this.conversation!.getLastToolCalls();

				if (!toolCalls || toolCalls.length === 0) {
					throw new Error('No tool calls found');
				}

				const toolResponse = await this.operator.executeInParallel(toolCalls);

				// Let's filter out tools that sent back undefined
				const toolsStillWaitingForAnswer = [];
				const toolsWithAnswer = [];
				for (const tool of toolResponse) {
					if (tool.content === undefined) {
						toolsStillWaitingForAnswer.push(tool);
					} else {
						toolsWithAnswer.push(tool);
					}
				}

				this.conversation!.addMessages(toolsWithAnswer);
				if (toolsStillWaitingForAnswer.length > 0) {
					this.conversation!.currentStep = ConversationSteps.WaitingForUserInput;
				} else {
					this.conversation!.currentStep = ConversationSteps.ToolsResponseReceived;
				}

				await this.stateSerializer.save(this.conversation!);

				return toolResponse;
			case ConversationSteps.Stopped:
				if (this.hooks?.onConversationStopped) {
					this.hooks.onConversationStopped(this.conversation!);
				}
				break;
			default:
				console.log('No more steps to run');
				break;
		}
	}

	async startConversation(conversationId?: string) {
		const newConversation = new Conversation(conversationId);
		this.conversationId = newConversation.id;
		this.conversation = newConversation;
		await this.stateSerializer.save(newConversation);

		return newConversation;
	}

	async endConversation() {
		await this.loadConversation();

		this.conversation!.currentStep = ConversationSteps.Ended;
		await this.stateSerializer.save(this.conversation!);
	}

	async loadConversation() {
		if (!this.conversationId) {
			throw new Error('Conversation has not started');
		}

		if (!this.conversation) {
			this.conversation = await this.stateSerializer.load(this.conversationId);
		}

		if (!this.conversation) {
			throw new Error("Couldn't load conversation");
		}
	}

	async addMessages(messages: BaseMessage[]) {
		await this.loadConversation();

		if (!this.conversation) {
			throw new Error("Couldn't load conversation");
		}

		this.conversation.addMessages(messages);

		await this.stateSerializer.save(this.conversation);

		return this.conversation;
	}

	async addUserInputToConversation(input: string, toolCallId: string) {
		await this.loadConversation();

		const toolAnswerMessage = new ToolMessage({ content: input, tool_call_id: toolCallId, status: 'success' });
		this.conversation!.addMessages([toolAnswerMessage]);
		await this.stateSerializer.save(this.conversation!);
	}

	async runNextStep() {
		await this.loadConversation();

		try {
			return await this.executeNextStep();
		} catch (error) {
			if (this.retryPlan) {
				for (let i = 0; i < this.retryPlan.numOfRetries; i++) {
					console.error(error);
					console.log(`Retry attempt ${i + 1} of ${this.retryPlan.numOfRetries}...`);
					try {
						await new Promise((resolve) => setTimeout(resolve, this.retryPlan!.retryDelayInSeconds * 1000));
						return await this.executeNextStep();
					} catch (retryError) {
						if (i === this.retryPlan.numOfRetries - 1) {
							// If this was the last retry attempt, throw the error
							throw retryError;
						}
						// Otherwise continue to the next retry
						console.log(`Retry attempt ${i + 1} failed, continuing...`);
					}
				}
			}
			// If we have no retry plan or all retries failed, throw the original error
			throw error;
		}
	}

	async conduct() {
		await this.loadConversation();

		const conversationNumberOfSteps = this.conversation!.messages.length;

		while (
			(console.log(`Conductor: Conducting... step number ${conversationNumberOfSteps}`),
			this.conversation!.currentStep !== ConversationSteps.Stopped &&
				this.conversation!.currentStep !== ConversationSteps.Ended &&
				this.conversation!.currentStep !== ConversationSteps.WaitingForUserInput &&
				conversationNumberOfSteps < 30)
		) {
			await this.runNextStep();
		}

		return this.conversation;
	}

	async getConversation() {
		await this.loadConversation();

		return this.conversation;
	}

	async getCurrentStep() {
		await this.loadConversation();

		return this.conversation!.currentStep;
	}

	async getFinalOutput() {
		await this.loadConversation();

		return this.conversation!.messages[this.conversation!.messages.length - 1].content;
	}

	// continueWithTask(task: Task) {
	//     if (!this.conversationId) {
	//         throw new Error('Conversation has not started');
	//     }

	//     const conversation = await this.stateSerializer.load(this.conversationId);

	//     const messages = await task.run(conversation.messages, {
	//         tools: this.operator?.getTools(),
	//     });

	//     conversation.addMessages([messages]);
	// 	await this.stateSerializer.save(conversation);

	// 	return messages;
	// }

	// continueWithMessages(messages: BaseMessage[]) {
	//     if (!this.conversationId) {
	//         throw new Error('Conversation has not started');
	//     }

	//     const conversation = await this.stateSerializer.load(this.conversationId);
	//     conversation.addMessages(messages);
	// 	await this.stateSerializer.save(conversation);

	// 	switch (conversation.currentStep) {
	// 		case ConversationSteps.WaitingForLLMResponse:

	//             break;
	// 	}
	// }

	// async addToConversation(messages: BaseMessage[]) {
	// 	if (!this.conversationId) {
	// 		throw new Error('Conversation has not started');
	// 	}

	// 	const conversation = await this.stateSerializer.load(this.conversationId);
	// 	conversation.addMessages(messages);
	// 	await this.stateSerializer.save(conversation);

	// 	switch (conversation.currentStep) {
	// 		case ConversationSteps.WaitingForLLMResponse:
	//             break;

	// }

	// async continueConversation(task: Task, inputs: Record<string, any>) {
	// 	if (!this.conversationId) {
	// 		throw new Error('Conversation has not started');
	// 	}

	// 	const conversation = await this.stateSerializer.load(this.conversationId);
	// 	const messages = await Conductor.runTask(task, inputs, {
	// 		tools: this.operator?.getTools(),
	// 		previousMessages: conversation.messages,
	// 	});
	// 	conversation.addMessages(messages);
	// 	await this.stateSerializer.save(conversation);

	// 	return messages;
	// }
}

export { Conductor };
