import { SEARCH_MODELS } from "@/models/enums";
import { SearchResult, SearchWithSchemaResult } from "@/models/Search";
import Environment from "@/utils/environment";
import { PerplexitySearchResult } from "@/models/PerplexitySearchResults";

/**
 * Asks a question to the Perplexity AI model and retrieves the answer.
 *
 * @param {string} question - The question to be asked.
 * @param {SEARCH_MODELS} [modelToUse=SEARCH_MODELS.PERPLEXITY_SMALL] - The model to use for the search.
 * @returns {Promise<SearchResult | null>} - A promise that resolves to the search result or null.
 */
export async function askQuestion(
	question: string,
	modelToUse: SEARCH_MODELS = SEARCH_MODELS.PERPLEXITY_SMALL,
): Promise<SearchResult | null> {
	const result = await fetch("https://api.perplexity.ai/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			accept: "application/json",
			Authorization: `Bearer ${Environment.PERPLEXITY_API_KEY}`,
		},
		body: JSON.stringify({
			model: modelToUse,
			messages: [
				{
					role: "system",
					content: "Be precise and accurate in your answers.",
				},
				{
					role: "user",
					content: question,
				},
			],
		}),
	});

	const data: PerplexitySearchResult = await result.json();

	const answer = data.choices[0].message.content;
	const sources = data.citations
		? data.citations.map((citation) => ({
			title: citation,
			url: citation,
		}))
		: [];

	return { answer, sources };
}

/**
 * Searches with a schema using the Perplexity AI model and retrieves the answer.
 *
 * @param {string} question - The question to be asked.
 * @param {object} schema - The JSON schema to validate the response.
 * @param {string} schemaDescription - A description of the schema fields.
 * @param {SEARCH_MODELS} [modelToUse=SEARCH_MODELS.PERPLEXITY_SMALL] - The model to use for the search.
 * @returns {Promise<SearchWithSchemaResult | null>} - A promise that resolves to the search result with schema or null.
 */
export async function searchWithSchema(
	question: string,
	schema: object,
	schemaDescription: string,
	modelToUse: SEARCH_MODELS = SEARCH_MODELS.PERPLEXITY_SMALL,
): Promise<SearchWithSchemaResult | null> {
	const result = await fetch("https://api.perplexity.ai/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			accept: "application/json",
			Authorization: `Bearer ${Environment.PERPLEXITY_API_KEY}`,
		},
		body: JSON.stringify({
			model: modelToUse,
			messages: [
				{
					role: "system",
					content:
						`Be precise and accurate in your answers. Return the answer and the sources in a JSON object with the following fields: ${schemaDescription}. Return only the valid JSON object without any other text.`,
				},
				{
					role: "user",
					content: question,
				},
			],
			response_format: {
				type: "json_schema",
				json_schema: {
					schema: schema,
				},
			},
		}),
	});
	const data: PerplexitySearchResult = await result.json();

	const answerString = data.choices[0].message.content.replace("```json", "")
		.replace("```", "");
	const answer = JSON.parse(answerString);
	const sources = data.citations.map((citation) => ({
		title: citation,
		url: citation,
	}));

	return { answer, sources };
}
