import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import Environment from "@/utils/environment";
import { GoogleShoppingResults } from "@/models/GoogleSearch";

const crawlGoogleShoppingToolSchema: StructuredToolParams = {
	name: "crawl_google_shopping",
	description: "Crawl google shopping and return the results.",
	schema: z.object({
		query: z.string().describe("The query to search for"),
	}),
};

const crawlGoogleShoppingTool = tool(async (input: any) => {
	const { query } = input;
	const result = await fetch("https://google.serper.dev/shopping", {
		method: "POST",
		headers: {
			"X-API-KEY": Environment.SERPER_DEV_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ q: query }),
	});

	if (!result.ok) {
		throw new Error("Failed to fetch Google Shopping results");
	}

	const data = await result.json();

	return data as GoogleShoppingResults;
}, crawlGoogleShoppingToolSchema);

/**
 * A tool that enables LLM agents to search for products on Google Shopping using the Serper.dev API.
 *
 * @description
 * This tool allows agents to:
 * - Search for products on Google Shopping
 * - Get structured product data including prices, titles, and merchant information
 * - Compare products and their prices
 *
 * @example
 * // Example usage in an agent:
 * const agent = new Agent({
 *   tools: [crawlGoogleShoppingTool],
 *   // ... other configuration
 * });
 *
 * // The agent can then use it like:
 * // "I need to search for 'iphone 14 pro max'"
 * // Tool will return structured product data
 *
 * @params
 * - query: string - The search query for Google Shopping (e.g., "iphone 14 pro max")
 *
 * @returns
 * GoogleShoppingResults object containing:
 * - shopping_results: Array of product results
 * - pagination: Pagination information
 * - search_metadata: Search-related metadata
 *
 * @requires
 * - SERPER_DEV_API_KEY environment variable must be set
 * - Valid Serper.dev API subscription
 */
export { crawlGoogleShoppingTool };
