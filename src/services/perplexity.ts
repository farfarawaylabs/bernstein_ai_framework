import { SEARCH_MODELS } from '@/models/enums';
import { SearchResult, SearchWithSchemaResult } from '@/models/Search';
import Environment from '@/utils/environment';
import { PerplexitySearchResult } from '@/models/PerplexitySearchResults';

export async function askQuestion(
	question: string,
	modelToUse: SEARCH_MODELS = SEARCH_MODELS.PERPLEXITY_SMALL
): Promise<SearchResult | null> {
	const result = await fetch('https://api.perplexity.ai/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			accept: 'application/json',
			Authorization: `Bearer ${Environment.PERPLEXITY_API_KEY}`,
		},
		body: JSON.stringify({
			model: modelToUse,
			messages: [
				{
					role: 'system',
					content: 'Be precise and accurate in your answers.',
				},
				{
					role: 'user',
					content: question,
				},
			],
		}),
	});
	console.log(result);
	const data: PerplexitySearchResult = await result.json();

	const answer = data.choices[0].message.content;
	const sources = data.citations.map((citation) => ({
		title: citation,
		url: citation,
	}));

	return { answer, sources };
}

export async function searchWithSchema(
	question: string,
	schema: object,
	schemaDescription: string,
	modelToUse: SEARCH_MODELS = SEARCH_MODELS.PERPLEXITY_SMALL
): Promise<SearchWithSchemaResult | null> {
	const result = await fetch('https://api.perplexity.ai/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			accept: 'application/json',
			Authorization: `Bearer ${Environment.PERPLEXITY_API_KEY}`,
		},
		body: JSON.stringify({
			model: modelToUse,
			messages: [
				{
					role: 'system',
					content: `Be precise and accurate in your answers. Return the answer and the sources in a JSON object with the following fields: ${schemaDescription}. Return only the valid JSON object without any other text.`,
				},
				{
					role: 'user',
					content: question,
				},
			],
			response_format: {
				type: 'json_schema',
				json_schema: {
					schema: schema,
				},
			},
		}),
	});
	const data: PerplexitySearchResult = await result.json();
	console.log(JSON.stringify(data, null, 2));
	const answerString = data.choices[0].message.content.replace('```json', '').replace('```', '');
	const answer = JSON.parse(answerString);
	const sources = data.citations.map((citation) => ({
		title: citation,
		url: citation,
	}));

	return { answer, sources };
}
