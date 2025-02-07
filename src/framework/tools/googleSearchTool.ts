import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import Environment from '@/utils/environment';
import { GoogleSearchResults } from '@/models/GoogleSearch';

const googleSearchToolSchema: StructuredToolParams = {
	name: 'google_search',
	description: 'Search google and return the results.',
	schema: z.object({
		query: z.string().describe('The query to search for'),
	}),
};

const googleSearchTool = tool(async (input: any) => {
	const { query } = input;
	console.log(`Running tool:GoogleSearchTool: Searching for: ${query}`);

	const result = await fetch('https://google.serper.dev/search', {
		method: 'POST',
		headers: {
			'X-API-KEY': Environment.SERPER_DEV_API_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ q: query }),
	});

	if (!result.ok) {
		throw new Error('Failed to fetch Google Shopping results');
	}

	const data = await result.json();

	return { organicSearchResults: (data as GoogleSearchResults).organic };
}, googleSearchToolSchema);

export { googleSearchTool };
