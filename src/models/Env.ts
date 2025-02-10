import { AI_MODELS, EMBEDDING_MODELS } from "./enums";

export interface Env {
	OPENAI_API_KEY: string;
	DEEPSEEK_API_KEY: string;
	BERNSTEIN_CACHE: KVNamespace;
	PERPLEXITY_API_KEY: string;
	SENDGRID_API_KEY: string;
	NABUAI_API_KEY: string;
	SERPER_DEV_API_KEY: string;
	SUPABASE_URL: string;
	SUPABASE_PRIVATE_KEY: string;
	userId: string;
}
