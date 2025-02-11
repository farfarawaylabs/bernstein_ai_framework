import {
	AIMessage,
	BaseMessage,
	ChatMessage,
	ChatMessageFieldsWithRole,
	FunctionMessage,
	FunctionMessageFieldsWithName,
	HumanMessage,
	StoredMessage,
	SystemMessage,
	ToolMessage,
	ToolMessageFieldsWithToolCallId,
} from "@langchain/core/messages";

/**
 * Serializes a single message to a dictionary format.
 * @param message - The message to serialize.
 * @returns The serialized message as a dictionary.
 */
export const serializeMessage = (message: BaseMessage) => {
	return message.toDict();
};

/**
 * Serializes an array of messages to a dictionary format.
 * @param messages - The array of messages to serialize.
 * @returns An array of serialized messages.
 */
export const serializeMessages = (messages: BaseMessage[]) => {
	return messages.map(serializeMessage);
};

/**
 * Deserializes a single message from a dictionary format.
 * @param message - The message dictionary to deserialize.
 * @returns The deserialized message object.
 */
export const deserializeMessage = (message: any) => {
	return mapStoredMessageToChatMessage(message);
};

/**
 * Deserializes an array of messages from a dictionary format.
 * @param messages - The array of message dictionaries to deserialize.
 * @returns An array of deserialized message objects.
 */
export const deserializeMessages = (messages: any[]) => {
	return messages.map(deserializeMessage);
};

/**
 * Maps a stored message to a specific chat message type based on its type.
 * @param storedMessage - The stored message to map.
 * @returns The corresponding chat message object.
 * @throws Error if the message type is unexpected or required fields are missing.
 */
function mapStoredMessageToChatMessage(storedMessage: StoredMessage) {
	switch (storedMessage.type) {
		case "human":
			return new HumanMessage(storedMessage.data);
		case "ai":
			return new AIMessage(storedMessage.data);
		case "system":
			return new SystemMessage(storedMessage.data);
		case "function":
			if (storedMessage.data.name === undefined) {
				throw new Error("Name must be defined for function messages");
			}
			return new FunctionMessage(
				storedMessage.data as FunctionMessageFieldsWithName,
			);
		case "tool":
			if (storedMessage.data.tool_call_id === undefined) {
				throw new Error(
					"Tool call ID must be defined for tool messages",
				);
			}
			return new ToolMessage(
				storedMessage.data as ToolMessageFieldsWithToolCallId,
			);
		case "generic": {
			if (storedMessage.data.role === undefined) {
				throw new Error("Role must be defined for chat messages");
			}
			return new ChatMessage(
				storedMessage.data as ChatMessageFieldsWithRole,
			);
		}
		default:
			throw new Error(`Got unexpected type: ${storedMessage.type}`);
	}
}
