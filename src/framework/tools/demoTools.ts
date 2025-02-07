import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';

const simpleToolSchema: StructuredToolParams = {
	name: 'get_current_weather',
	description: 'Get the current weather for a location',
	schema: z.object({
		city: z.string().describe('The city to get the weather for'),
		state: z.string().optional().describe('The state to get the weather for'),
	}),
};

// const weatherTool = () => {
// 	return createTool(async (input: any) => {
// 		console.log('INSIDE weather tool for input ', input);
// 		const { city, state } = input;
// 		return `The weather in ${city}, ${state} is sunny with a temperature of 70 degrees and humidity of 50%`;
// 	}, simpleToolSchema);
// };

const weatherTool = tool(async (input: any) => {
	console.log('INSIDE weather tool for input ', input);
	const { city, state } = input;
	if (city === 'Boston') {
		return undefined;
	}
	return `The weather in ${city}, ${state} is sunny with a temperature of 70 degrees and humidity of 50%`;
}, simpleToolSchema);

export { weatherTool };
