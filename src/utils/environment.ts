import { AI_MODELS, EMBEDDING_MODELS } from "@/models/enums";
import { Env } from "@/models/Env";

export default class Environment {
	static OPENAI_API_KEY: string;
	static DEEPSEEK_API_KEY: string;
	static PERPLEXITY_API_KEY: string;
	static SENDGRID_API_KEY: string;
	static NABUAI_API_KEY: string;
	static KV_CACHE: KVNamespace;
	static SERPER_DEV_API_KEY: string;
	static SUPABASE_URL: string;
	static SUPABASE_PRIVATE_KEY: string;
	static ANTHROPIC_API_KEY: string;
	static FEEDBACK_EMAIL: string;
	static userId: string;
	static CONTENT_GENERATION_QUEUE: Queue<any>;
}

export function initializeEnvironment(env: Env) {
	Environment.OPENAI_API_KEY = env.OPENAI_API_KEY;
	Environment.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
	Environment.DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
	Environment.PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
	Environment.SENDGRID_API_KEY = env.SENDGRID_API_KEY;
	Environment.NABUAI_API_KEY = env.NABUAI_API_KEY;
	Environment.KV_CACHE = env.BERNSTEIN_CACHE;
	Environment.SERPER_DEV_API_KEY = env.SERPER_DEV_API_KEY;
	Environment.SUPABASE_URL = env.SUPABASE_URL;
	Environment.SUPABASE_PRIVATE_KEY = env.SUPABASE_PRIVATE_KEY;
	Environment.userId = env.userId;
	Environment.CONTENT_GENERATION_QUEUE = env.CONTENT_GENERATION_QUEUE;
	Environment.FEEDBACK_EMAIL = env.FEEDBACK_EMAIL;
}
