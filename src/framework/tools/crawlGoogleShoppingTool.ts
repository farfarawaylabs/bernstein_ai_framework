import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import Environment from '@/utils/environment';
import { GoogleShoppingResults } from '@/models/GoogleSearch';

const crawlGoogleShoppingToolSchema: StructuredToolParams = {
	name: 'crawl_google_shopping',
	description: 'Crawl google shopping and return the results.',
	schema: z.object({
		query: z.string().describe('The query to search for'),
	}),
};

const crawlGoogleShoppingTool = tool(async (input: any) => {
	const { query } = input;
	const result = await fetch('https://google.serper.dev/shopping', {
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

	return data as GoogleShoppingResults;
}, crawlGoogleShoppingToolSchema);

export { crawlGoogleShoppingTool };
