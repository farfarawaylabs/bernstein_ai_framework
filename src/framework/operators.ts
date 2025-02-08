import { BaseMessage, ToolMessage } from '@langchain/core/messages';

interface ToolCall {
	args: Record<string, any>;
	id?: string;
	name: string;
}

class Operator {
	private tools: Record<string, any>;
	constructor(tools: Record<string, any>) {
		this.tools = tools;
	}

	getTool(name: string) {
		return this.tools[name];
	}

	getTools() {
		return Object.values(this.tools);
	}

	async execute(calls: ToolCall[]) {
		const results = [];
		for (const toolCall of calls) {
			const selectedTool = this.getTool(toolCall.name);
			const toolResultMessage = await selectedTool.invoke(toolCall);
			results.push(toolResultMessage);
		}

		return results;
	}

	async executeInParallel(calls: ToolCall[]) {
		const promisses = [];
		for (const toolCall of calls) {
			const selectedTool = this.getTool(toolCall.name);
			promisses.push(selectedTool.invoke(toolCall));
		}

		const results = await Promise.allSettled(promisses);

		const messages = results.map((result, index) => {
			if (result.status === 'fulfilled') {
				return result.value;
			} else {
				return new ToolMessage({
					content: 'Error executing tool.',
					name: calls[index].name,
					tool_call_id: calls[index].id || '',
				});
			}
		});

		return messages as BaseMessage[];
	}
}

export { Operator };
