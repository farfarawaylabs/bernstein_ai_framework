import { BaseMessage, ToolMessage } from "@langchain/core/messages";

/**
 * Represents a call to a tool with specific arguments.
 */
export interface ToolCall {
	args: Record<string, any>; // Arguments to be passed to the tool
	id?: string; // Optional identifier for the tool call
	name: string; // Name of the tool to be invoked
}

export interface OperatorConfig {
	tools: Record<string, any>;
	serializeToolCall?: (
		taskId: string,
		toolCall: ToolCall,
		result: any,
	) => Promise<void>;
	taskId?: string;
}

/**
 * The Operator class encapsulates functionality for managing and executing agent tools (skills).
 * It provides methods to retrieve tools and execute them either sequentially or in parallel.
 */
class Operator {
	private tools: Record<string, any>; // A collection of tools available for execution
	private serializeToolCall?: (
		taskId: string,
		toolCall: ToolCall,
		result: any,
	) => Promise<void>;
	private taskId?: string;

	/**
	 * Constructs an Operator instance with a given set of tools.
	 * @param tools - A record of tools where the key is the tool name and the value is the tool instance.
	 */
	constructor(config: OperatorConfig) {
		this.tools = config.tools;
		this.serializeToolCall = config.serializeToolCall;
		this.taskId = config.taskId;
	}

	/**
	 * Retrieves a tool by its name.
	 * @param name - The name of the tool to retrieve.
	 * @returns The tool instance associated with the given name.
	 */
	getTool(name: string) {
		return this.tools[name];
	}

	/**
	 * Retrieves all available tools.
	 * @returns An array of all tool instances.
	 */
	getTools() {
		return Object.values(this.tools);
	}

	/**
	 * Executes a series of tool calls sequentially.
	 * @param calls - An array of ToolCall objects representing the tools to be executed.
	 * @returns A promise that resolves to an array of results from the tool executions.
	 */
	async execute(calls: ToolCall[]) {
		const results = [];
		for (const toolCall of calls) {
			const selectedTool = this.getTool(toolCall.name);
			const toolResultMessage = await selectedTool.invoke(toolCall);
			results.push(toolResultMessage);
		}

		return results;
	}

	/**
	 * Executes a series of tool calls in parallel.
	 * @param calls - An array of ToolCall objects representing the tools to be executed.
	 * @returns A promise that resolves to an array of BaseMessage objects, each representing the result of a tool execution.
	 *          If a tool execution fails, a ToolMessage with an error content is returned for that tool.
	 */
	async executeInParallel(calls: ToolCall[]) {
		const promisses = [];
		if (calls && calls.length > 0) {
			console.log("calls are: ", calls, JSON.stringify(calls, null, 2));
		} else {
			console.log("no calls");
		}
		console.log("tools are: ", JSON.stringify(this.tools, null, 2));
		for (const toolCall of calls) {
			const selectedTool = this.getTool(toolCall.name);
			promisses.push(selectedTool.invoke(toolCall));
		}

		const results = await Promise.allSettled(promisses);

		const messages = results.map((result, index) => {
			if (result.status === "fulfilled") {
				return result.value;
			} else {
				return new ToolMessage({
					content: "Error executing tool.",
					name: calls[index].name,
					tool_call_id: calls[index].id || "",
				});
			}
		});

		if (this.serializeToolCall && this.taskId) {
			for (const [index, currCallResult] of messages.entries()) {
				await this.serializeToolCall(
					this.taskId,
					calls[index],
					currCallResult,
				);
			}
		}

		return messages as BaseMessage[];
	}
}

export { Operator };
