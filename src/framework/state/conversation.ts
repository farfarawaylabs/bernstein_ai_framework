import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { deserializeMessages, serializeMessages } from './baseSerializers';

export enum ConversationSteps {
	Initializing = 'initializing',
	Started = 'started',
	Ended = 'ended',
	Stopped = 'stopped',
	WaitingForLLMResponse = 'waiting_for_llm_response',
	WaitingForToolsResponse = 'waiting_for_tools_response',
	ToolsResponseReceived = 'tools_response_received',
	WaitingForUserInput = 'waiting_for_user_input',
}

export class Conversation {
	id: string;
	startTime: Date;
	endTime: Date | undefined;
	messages: BaseMessage[];
	currentStep: ConversationSteps;

	constructor() {
		this.id = crypto.randomUUID();
		this.startTime = new Date();
		this.endTime = undefined;
		this.messages = [];
		this.currentStep = ConversationSteps.Started;
	}

	addMessages(messages: BaseMessage[]) {
		if (this.messages.length > 0) {
			console.log('before adding messages ', this.messages[this.messages.length - 1].getType());
		}
		this.messages.push(...messages);

		const lastMessage = this.messages[this.messages.length - 1];

		console.log('last message ', lastMessage);

		switch (lastMessage.getType()) {
			case 'tool':
				this.currentStep = ConversationSteps.ToolsResponseReceived;
				break;
			case 'ai':
				if ((lastMessage as AIMessage).tool_calls && (lastMessage as AIMessage).tool_calls!.length > 0) {
					this.currentStep = ConversationSteps.WaitingForToolsResponse;
				} else {
					this.currentStep = ConversationSteps.Stopped;
				}
				break;
			case 'human':
				this.currentStep = ConversationSteps.WaitingForLLMResponse;
				break;
			case 'generic':
				this.currentStep = ConversationSteps.Stopped;
				break;
			case 'system':
				this.currentStep = ConversationSteps.Started;
				break;
			case 'developer':
				this.currentStep = ConversationSteps.Started;
				break;
			default:
				this.currentStep = ConversationSteps.Started;
				break;
		}

		console.log('after adding messages ', lastMessage.getType(), this.currentStep);
	}

	getLastMessage() {
		return this.messages[this.messages.length - 1];
	}

	getLastToolCalls() {
		const lastMessage = this.getLastMessage();
		console.log('in getLastToolCalls lastMessage: ', lastMessage.getType(), lastMessage);

		if (lastMessage.getType() !== 'ai') {
			return [];
		}

		const calls = (lastMessage as AIMessage).tool_calls;

		if (!calls) {
			return [];
		}

		console.log('calls: ', calls);
		return calls;
	}

	serializeState() {
		return Conversation.getConversationSerializedState(this);
	}

	deserializeState(serializedState: Record<string, any>) {
		return Conversation.deserializeConversationState(serializedState);
	}

	static getConversationSerializedState(conversation: Conversation) {
		return {
			id: conversation.id,
			startTime: conversation.startTime,
			endTime: conversation.endTime,
			messages: serializeMessages(conversation.messages),
			currentStep: conversation.currentStep,
		};
	}

	static deserializeConversationState(serializedState: Record<string, any>) {
		const conversation = new Conversation();
		conversation.id = serializedState.id;
		conversation.startTime = serializedState.startTime;
		conversation.endTime = serializedState.endTime;
		conversation.messages = deserializeMessages(serializedState.messages);
		conversation.currentStep = serializedState.currentStep;
		return conversation;
	}
}
