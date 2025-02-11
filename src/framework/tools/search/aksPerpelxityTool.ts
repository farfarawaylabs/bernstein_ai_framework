/**
 * @file aksPerplexityTool.ts
 *
 * @description
 * This file defines a tool that can be used as a skill for an LLM (Large Language Model) agent.
 * The tool, `aksPerplexityTool`, allows the agent to ask questions on the internet and retrieve
 * compiled responses. It leverages the Perplexity service to crawl the web and gather information
 * based on the provided question.
 *
 * @exports
 * - aksPerplexityTool: A function that takes a question as input and returns a response from the web.
 *
 * @usage
 * The `aksPerplexityTool` can be integrated into an LLM agent's skill set to enhance its ability
 * to fetch real-time information from the internet. This is particularly useful for applications
 * requiring up-to-date data or answers to specific queries.
 *
 * @schema
 * The tool uses a schema defined by `zod` to validate the input. The schema expects an object with
 * a single property:
 * - `question`: A string representing the question to be asked on the internet.
 *
 * @example
 * ```typescript
 * import { aksPerplexityTool } from '@/framework/tools/search/aksPerplexityTool';
 *
 * const question = { question: "What is the current weather in New York?" };
 * aksPerplexityTool(question).then(response => {
 *   console.log(response);
 * });
 * ```
 *
 * @dependencies
 * - `zod`: For input validation.
 * - `@langchain/core/tools`: For tool creation and management.
 * - `askQuestion`: A service function that interfaces with the Perplexity API to perform the web search.
 */

import { z } from "zod";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { askQuestion } from "@/services/perplexity";

const aksPerplexityToolSchema: StructuredToolParams = {
	name: "ask_question_from_web",
	description:
		"Perplexity is a tool that can be used to ask questions and get responses from the internet. The tool crawls the web and compile the results into a single response.",
	schema: z.object({
		question: z.string().describe("The question to ask the internet"),
	}),
};

const aksPerplexityTool = tool(async (input: any) => {
	const { question } = input;
	console.log(`Running tool:AksPerplexityTool: Asking question: ${question}`);
	const result = await askQuestion(question);
	return result;
}, aksPerplexityToolSchema);

export { aksPerplexityTool };
