export interface PerplexitySearchResult {
	id: string;
	model: string;
	created: number;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	citations: string[];
	object: string;
	choices: Choice[];
}

interface Choice {
	index: number;
	finish_reason: string;
	message: Message;
	delta: Delta;
}

interface Message {
	role: string;
	content: string;
}

interface Delta {
	role: string;
	content: string;
}
