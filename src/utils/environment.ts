import { AI_MODELS, EMBEDDING_MODELS } from '@/models/enums';
import { Env } from '@/models/Env';

export default class Environment {
	static OPENAI_API_KEY: string;
	static PERPLEXITY_API_KEY: string;
	static SENDGRID_API_KEY: string;
	static KV_CACHE: KVNamespace;
}

export function initializeEnvironment(env: Env) {
	Environment.OPENAI_API_KEY = env.OPENAI_API_KEY;
	Environment.PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
	Environment.SENDGRID_API_KEY = env.SENDGRID_API_KEY;
	Environment.KV_CACHE = env.BERNSTEIN_CACHE;
}
