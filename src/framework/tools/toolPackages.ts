import { AI_MODELS } from "@/models/enums";
import { crawlUrlTool } from "./crawlurlTool";
import { aksPerplexityTool } from "./search/aksPerpelxityTool";
import { crawlGoogleShoppingTool } from "./search/crawlGoogleShoppingTool";
import { googleSearchTool } from "./search/googleSearchTool";
import { createGeneralWriterTool } from "./writing/GenericWriterAgentTool";

export function getResearchToolsPackage() {
	return {
		ask_question_from_web: aksPerplexityTool,
		google_search: googleSearchTool,
		crawl_url: crawlUrlTool,
		crawl_google_shopping: crawlGoogleShoppingTool,
	};
}

export function getWritingToolsPackage(model: AI_MODELS = AI_MODELS.CHATGPT4O) {
	return {
		writer_agent: createGeneralWriterTool(model),
	};
}
