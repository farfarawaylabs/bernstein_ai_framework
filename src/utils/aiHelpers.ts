import { AI_MODELS, EMBEDDING_MODELS } from '@/models/enums';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

import Environment from './environment';

export const getAIModel = (model: AI_MODELS) => {
	switch (model) {
		case AI_MODELS.CHATGPT4O:
			return new ChatOpenAI({
				model: 'gpt-4o',
				apiKey: Environment.OPENAI_API_KEY,
			});

		case AI_MODELS.CHATGPT4O_MINI:
			return new ChatOpenAI({
				model: 'gpt-4o-mini',
				apiKey: Environment.OPENAI_API_KEY,
			});

		case AI_MODELS.DEEPSEEK:
			return new ChatOpenAI({
				model: 'deepseek-chat',
				configuration: {
					baseURL: 'https://api.deepseek.com',
				},
				apiKey: Environment.DEEPSEEK_API_KEY,
			});

		case AI_MODELS.DEEPSEEK_R1: {
			const model = new ChatOpenAI({
				model: 'deepseek-reasoner',

				configuration: {
					baseURL: 'https://api.deepseek.com',
				},

				apiKey: Environment.DEEPSEEK_API_KEY,
			});
			model.bind({ response_format: { type: 'json_object' } });
			return model;
		}

		default:
			throw new Error('Invalid AI model');
	}
};

export const getAIEmbeddingModel = (model: EMBEDDING_MODELS) => {
	switch (model) {
		case EMBEDDING_MODELS.OPENAI:
			return new OpenAIEmbeddings({
				apiKey: Environment.OPENAI_API_KEY,
				model: 'text-embedding-3-large',
				dimensions: 1536,
			});

		default:
			throw new Error('Invalid AI embedding model');
	}
};
