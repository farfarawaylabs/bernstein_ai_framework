import { AI_MODELS, EMBEDDING_MODELS } from './enums';

export interface Env {
	OPENAI_API_KEY: string;
	BERNSTEIN_CACHE: KVNamespace;
	PERPLEXITY_API_KEY: string;
	SENDGRID_API_KEY: string;
}
