import {
	AIMessage,
	FunctionMessage,
	SystemMessage,
	HumanMessage,
	StoredMessage,
	FunctionMessageFieldsWithName,
	ToolMessage,
	ToolMessageFieldsWithToolCallId,
	ChatMessage,
	ChatMessageFieldsWithRole,
	BaseMessage,
} from '@langchain/core/messages';

export const serializeMessage = (message: BaseMessage) => {
	return message.toDict();
};

export const serializeMessages = (messages: BaseMessage[]) => {
	return messages.map(serializeMessage);
};

export const deserializeMessage = (message: any) => {
	return mapStoredMessageToChatMessage(message);
};

export const deserializeMessages = (messages: any[]) => {
	return messages.map(deserializeMessage);
};

function mapStoredMessageToChatMessage(storedMessage: StoredMessage) {
	switch (storedMessage.type) {
		case 'human':
			return new HumanMessage(storedMessage.data);
		case 'ai':
			return new AIMessage(storedMessage.data);
		case 'system':
			return new SystemMessage(storedMessage.data);
		case 'function':
			if (storedMessage.data.name === undefined) {
				throw new Error('Name must be defined for function messages');
			}
			return new FunctionMessage(storedMessage.data as FunctionMessageFieldsWithName);
		case 'tool':
			if (storedMessage.data.tool_call_id === undefined) {
				throw new Error('Tool call ID must be defined for tool messages');
			}
			return new ToolMessage(storedMessage.data as ToolMessageFieldsWithToolCallId);
		case 'generic': {
			if (storedMessage.data.role === undefined) {
				throw new Error('Role must be defined for chat messages');
			}
			return new ChatMessage(storedMessage.data as ChatMessageFieldsWithRole);
		}
		default:
			throw new Error(`Got unexpected type: ${storedMessage.type}`);
	}
}
