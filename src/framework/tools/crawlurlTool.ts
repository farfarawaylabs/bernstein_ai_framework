import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { ScrapedPage } from "@/models/ScrappedPage";
import Environment from "@/utils/environment";

/**
 * @module CrawlUrlTool
 *
 * @description
 * The CrawlUrlTool is a utility designed to crawl a specified URL and return its content.
 * It is structured to be used as a skill by an LLM agent, providing the ability to fetch
 * and process web page data. The tool sends a POST request to a scraping service and retrieves
 * the textual content and a summary of the page.
 *
 * @function crawlUrlTool
 *
 * @param {Object} input - The input object containing the URL to be crawled.
 * @param {string} input.url - The URL of the web page to crawl.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to an object containing:
 * - `scrappedText`: The textual content of the crawled page.
 * - `summary`: A summary of the crawled page.
 *
 * @example
 * const result = await crawlUrlTool({ url: 'https://example.com' });
 * console.log(result.scrappedText);
 * console.log(result.summary);
 *
 * @requires @langchain/core/tools
 * @requires zod
 * @requires @/models/ScrappedPage
 * @requires @/utils/environment
 */
const crawlUrlToolSchema: StructuredToolParams = {
	name: "crawl_url",
	description: "Crawl a url and return the content",
	schema: z.object({
		url: z.string().describe("The url to crawl"),
	}),
};

const crawlUrlTool = tool(async (input: any) => {
	const { url } = input;
	console.log(`Running tool:CrawlUrlTool: Crawling url: ${url}`);

	const response = await fetch(
		"https://scrapers-scrapeurl-64ujiq3rzq-ue.a.run.app",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Environment.NABUAI_API_KEY}`,
			},

			body: JSON.stringify({ url, options: { getEmbeddings: false } }),
		},
	);

	const data = (await response.json()) as ScrapedPage;

	return { scrappedText: data.textualContent, summary: data.summary };
}, crawlUrlToolSchema);

export { crawlUrlTool };
