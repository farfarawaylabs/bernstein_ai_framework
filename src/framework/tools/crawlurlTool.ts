import { z } from 'zod';
import { StructuredToolParams, tool } from '@langchain/core/tools';
import { ScrapedPage } from '@/models/ScrappedPage';
import Environment from '@/utils/environment';

const crawlUrlToolSchema: StructuredToolParams = {
	name: 'crawl_url',
	description: 'Crawl a url and return the content',
	schema: z.object({
		url: z.string().describe('The url to crawl'),
	}),
};

const crawlUrlTool = tool(async (input: any) => {
	const { url } = input;
	console.log(`Running tool:CrawlUrlTool: Crawling url: ${url}`);

	const response = await fetch('https://scrapers-scrapeurl-64ujiq3rzq-ue.a.run.app', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${Environment.NABUAI_API_KEY}`,
		},

		body: JSON.stringify({ url, options: { getEmbeddings: false } }),
	});

	const data = (await response.json()) as ScrapedPage;

	return { scrappedText: data.textualContent, summary: data.summary };
}, crawlUrlToolSchema);

export { crawlUrlTool };
