import { BaseMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";

/**
 * Interface representing a task that can be run with a set of inputs and an optional configuration.
 */
interface Task {
	/**
	 * Executes the task with the provided messages and configuration.
	 * @param inputs - An array of BaseMessage objects to process.
	 * @param config - Optional configuration for the task, including tools.
	 * @returns A promise that resolves to a BaseMessage.
	 */
	run(inputs: BaseMessage[], config?: TaskConfig): Promise<BaseMessage>;
}

/**
 * Configuration options for a task.
 */
export interface TaskConfig {
	/**
	 * An optional array of tools that the task can use during execution.
	 */
	tools?: DynamicStructuredTool[];
}

/**
 * Utility function to build a task with a consistent interface.
 * @param func - A function that processes messages and returns a promise resolving to a BaseMessage.
 * @returns An object with a run method that executes the provided function.
 */
const buildTask = (
	func: (
		messages: BaseMessage[],
		config?: TaskConfig,
	) => Promise<BaseMessage>,
) => {
	const run = async (messages: BaseMessage[], config?: TaskConfig) => {
		return await func(messages, config);
	};

	return {
		run,
	};
};

export { buildTask, type Task };
