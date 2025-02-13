import { AI_MODELS, EMBEDDING_MODELS } from "./enums";

export interface Env {
	BERNSTEIN_CACHE: KVNamespace;
	CONTENT_GENERATION_QUEUE: Queue<any>;
	OPENAI_API_KEY: string;
	ANTHROPIC_API_KEY: string;
	DEEPSEEK_API_KEY: string;
	PERPLEXITY_API_KEY: string;
	SENDGRID_API_KEY: string;
	NABUAI_API_KEY: string;
	SERPER_DEV_API_KEY: string;
	SUPABASE_URL: string;
	SUPABASE_PRIVATE_KEY: string;
	FEEDBACK_EMAIL: string;
	userId: string;
}
