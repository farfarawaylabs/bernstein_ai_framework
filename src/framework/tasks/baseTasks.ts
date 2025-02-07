import { BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';

interface Task {
	run(inputs: BaseMessage[], config?: TaskConfig): Promise<BaseMessage>;
}

export interface TaskConfig {
	tools?: DynamicStructuredTool[];
}

const buildTask = (func: (messages: BaseMessage[], config?: TaskConfig) => Promise<BaseMessage>) => {
	const run = async (messages: BaseMessage[], config?: TaskConfig) => {
		return await func(messages, config);
	};

	return {
		run,
	};
};

export { buildTask, type Task };
