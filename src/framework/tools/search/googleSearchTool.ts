import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import Environment from "@/utils/environment";
import { GoogleSearchResults } from "@/models/GoogleSearch";

/**
 * Google Search Tool
 *
 * This tool allows an agent to perform a Google search and retrieve the results.
 * It is designed to be used as a skill by an LLM agent, enabling it to query Google
 * and process the search results.
 *
 * Usage:
 * - The tool is invoked with a query string that represents the search term.
 * - It returns the organic search results from Google.
 *
 * Schema:
 * - name: google_search
 * - description: Search google and return the results.
 * - schema: An object containing:
 *   - query: A string representing the search query.
 *
 * Example:
 * ```
 * const results = await googleSearchTool({ query: 'OpenAI GPT-4' });
 * console.log(results.organicSearchResults);
 * ```
 *
 * Error Handling:
 * - Throws an error if the fetch request to the Google search API fails.
 *
 * Dependencies:
 * - Requires an API key from the environment variable `SERPER_DEV_API_KEY`.
 * - Uses the `fetch` API to make HTTP requests.
 *
 * @param input - An object containing the search query.
 * @returns An object containing the organic search results.
 */
const googleSearchToolSchema: StructuredToolParams = {
	name: "google_search",
	description: "Search google and return the results.",
	schema: z.object({
		query: z.string().describe("The query to search for"),
	}),
};

const googleSearchTool = tool(async (input: any) => {
	const { query } = input;
	console.log(`Running tool:GoogleSearchTool: Searching for: ${query}`);

	const result = await fetch("https://google.serper.dev/search", {
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

	return { organicSearchResults: (data as GoogleSearchResults).organic };
}, googleSearchToolSchema);

export { googleSearchTool };
