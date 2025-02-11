import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { deserializeMessages, serializeMessages } from "./baseSerializers";

export enum ConversationSteps {
	Initializing = "initializing",
	Started = "started",
	Ended = "ended",
	Stopped = "stopped",
	WaitingForLLMResponse = "waiting_for_llm_response",
	WaitingForToolsResponse = "waiting_for_tools_response",
	ToolsResponseReceived = "tools_response_received",
	WaitingForUserInput = "waiting_for_user_input",
}

/**
 * Represents a conversation with a series of messages and states.
 *
 * The Conversation class manages the lifecycle of a conversation, including
 * its initialization, message handling, and state transitions. It supports
 * serialization and deserialization for persistence.
 */
export class Conversation {
	/**
	 * Unique identifier for the conversation.
	 */
	id: string;

	/**
	 * Timestamp when the conversation started.
	 */
	startTime: Date;

	/**
	 * Timestamp when the conversation ended, if applicable.
	 */
	endTime: Date | undefined;

	/**
	 * List of messages exchanged in the conversation.
	 */
	messages: BaseMessage[];

	/**
	 * Current step or state of the conversation.
	 */
	currentStep: ConversationSteps;

	/**
	 * Initializes a new conversation instance.
	 *
	 * @param id - Optional unique identifier for the conversation. If not provided, a new UUID is generated.
	 */
	constructor(id?: string) {
		this.id = id || crypto.randomUUID();
		this.startTime = new Date();
		this.endTime = undefined;
		this.messages = [];
		this.currentStep = ConversationSteps.Started;
	}

	/**
	 * Adds messages to the conversation and updates the current step based on the last message type.
	 *
	 * @param messages - Array of messages to be added to the conversation.
	 */
	addMessages(messages: BaseMessage[]) {
		this.messages.push(...messages);

		const lastMessage = this.messages[this.messages.length - 1];

		switch (lastMessage.getType()) {
			case "tool":
				this.currentStep = ConversationSteps.ToolsResponseReceived;
				break;
			case "ai":
				if (
					(lastMessage as AIMessage).tool_calls &&
					(lastMessage as AIMessage).tool_calls!.length > 0
				) {
					this.currentStep =
						ConversationSteps.WaitingForToolsResponse;
				} else {
					this.currentStep = ConversationSteps.Stopped;
				}
				break;
			case "human":
				this.currentStep = ConversationSteps.WaitingForLLMResponse;
				break;
			case "generic":
				this.currentStep = ConversationSteps.Stopped;
				break;
			case "system":
				this.currentStep = ConversationSteps.Started;
				break;
			case "developer":
				this.currentStep = ConversationSteps.Started;
				break;
			default:
				this.currentStep = ConversationSteps.Started;
				break;
		}
	}

	/**
	 * Retrieves the last message in the conversation.
	 *
	 * @returns The last message object.
	 */
	getLastMessage() {
		return this.messages[this.messages.length - 1];
	}

	/**
	 * Retrieves the tool calls from the last AI message, if any.
	 *
	 * @returns An array of tool calls from the last AI message.
	 */
	getLastToolCalls() {
		const lastMessage = this.getLastMessage();

		if (lastMessage.getType() !== "ai") {
			return [];
		}

		const calls = (lastMessage as AIMessage).tool_calls;

		if (!calls) {
			return [];
		}

		return calls;
	}

	/**
	 * Retrieves all tool calls with a specific name from the conversation.
	 *
	 * @param name - The name of the tool call to search for.
	 * @returns An array of tool calls matching the specified name.
	 */
	getAllToolCallsWithName(name: string) {
		const toolCalls = [];
		for (const currMessage of this.messages) {
			if (currMessage.getType() === "ai") {
				const aiMessage = currMessage as AIMessage;
				if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
					for (const toolCall of aiMessage.tool_calls) {
						if (toolCall.name === name) {
							toolCalls.push(toolCall);
						}
					}
				}
			}
		}

		return toolCalls;
	}

	/**
	 * Retrieves all tool call results from the conversation.
	 *
	 * @returns An array of messages that are tool call results.
	 */
	getAllToolCallsResults() {
		return this.messages.filter((message) => message.getType() === "tool");
	}

	/**
	 * Serializes the current state of the conversation for persistence.
	 *
	 * @returns A serialized representation of the conversation state.
	 */
	serializeState() {
		return Conversation.getConversationSerializedState(this);
	}

	/**
	 * Deserializes a serialized conversation state and updates the current instance.
	 *
	 * @param serializedState - The serialized state to be deserialized.
	 * @returns A new Conversation instance with the deserialized state.
	 */
	deserializeState(serializedState: Record<string, any>) {
		return Conversation.deserializeConversationState(serializedState);
	}

	/**
	 * Static method to serialize a conversation instance.
	 *
	 * @param conversation - The conversation instance to serialize.
	 * @returns A serialized representation of the conversation.
	 */
	static getConversationSerializedState(conversation: Conversation) {
		return {
			id: conversation.id,
			startTime: conversation.startTime,
			endTime: conversation.endTime,
			messages: serializeMessages(conversation.messages),
			currentStep: conversation.currentStep,
		};
	}

	/**
	 * Static method to deserialize a conversation state into a new instance.
	 *
	 * @param serializedState - The serialized state to be deserialized.
	 * @returns A new Conversation instance with the deserialized state.
	 */
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
