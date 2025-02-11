import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * @module addUserInputTool
 *
 * @description
 * This module provides a tool for adding user input back into a conversation.
 * It is designed to be used internally by a conductor to manage user interactions
 * within a conversation flow. The tool allows an LLM agent to pause its operations
 * and request additional feedback or input from the user, which can then be
 * reintegrated into the ongoing conversation.
 *
 * @function addUserInputTool
 *
 * @param {Object} input - The input object containing user input and tool call ID.
 * @param {string} input.input - The user input to be added to the conversation.
 * @param {string} input.toolCallId - The identifier for the tool call to which the
 * user input should be returned.
 *
 * @returns {Promise<string>} - Returns a promise that resolves to the user input
 * string, allowing it to be processed or stored as needed.
 *
 * @example
 * // Example usage of addUserInputTool
 * const userInput = {
 *   input: "What is the weather like today?",
 *   toolCallId: "12345"
 * };
 *
 * addUserInputTool(userInput).then(response => {
 *   console.log(response); // Outputs: "What is the weather like today?"
 * });
 *
 * @schema
 * The tool uses a schema defined by zod to validate the input structure:
 * - input: A string representing the user's input.
 * - toolCallId: A string representing the tool call ID.
 */
const addUserInputToolSchema: StructuredToolParams = {
	name: "add_user_input",
	description:
		"Use internally by conductor to add back user input to the conversation",
	schema: z.object({
		input: z.string().describe("The user input to add to the conversation"),
		toolCallId: z.string().describe(
			"The tool call id we return the user input to",
		),
	}),
};

const addUserInputTool = tool(async (input: any) => {
	return input.input;
}, addUserInputToolSchema);

export { addUserInputTool };
