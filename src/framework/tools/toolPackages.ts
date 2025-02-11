import { AI_MODELS } from "@/models/enums";
import { crawlUrlTool } from "./crawlurlTool";
import { aksPerplexityTool } from "./search/aksPerpelxityTool";
import { crawlGoogleShoppingTool } from "./search/crawlGoogleShoppingTool";
import { googleSearchTool } from "./search/googleSearchTool";
import { createGeneralWriterTool } from "./writing/GenericWriterAgentTool";

/**
 * Provides convenience methods to give a language model a collection of skills.
 * These skills are organized into packages that can be used for research and writing tasks.
 */

/**
 * Returns a package of research tools.
 *
 * @returns An object containing tools for web-based research tasks.
 * - `ask_question_from_web`: A tool to ask questions and get answers from the web using Perplexity.
 * - `google_search`: A tool to perform Google searches.
 * - `crawl_url`: A tool to crawl and extract information from a given URL.
 * - `crawl_google_shopping`: A tool to crawl Google Shopping for product information.
 */
export function getResearchToolsPackage() {
	return {
		ask_question_from_web: aksPerplexityTool,
		google_search: googleSearchTool,
		crawl_url: crawlUrlTool,
		crawl_google_shopping: crawlGoogleShoppingTool,
	};
}

/**
 * Returns a package of writing tools.
 *
 * @param model - The AI model to be used for the writing tools. Defaults to `AI_MODELS.CHATGPT4O`.
 * @returns An object containing tools for writing tasks.
 * - `writer_agent`: A general-purpose writing tool that can generate text based on the specified AI model.
 */
export function getWritingToolsPackage(
	model: AI_MODELS = AI_MODELS.CHATGPT4O,
	taskId?: string,
) {
	return {
		writer_agent: createGeneralWriterTool(model, taskId),
	};
}
