import { AIPrompt } from "@/utils/prompts/AIPrompt";
import { BaseAgent } from "@/framework/agents/BaseAgent";
import { getResearchToolsPackage } from "@/framework/tools/toolPackages";
import { AI_MODELS } from "@/models/enums";
import { Conductor } from "@/framework/conductor";
import { HumanMessage } from "@langchain/core/messages";
import { BaseAgentProps } from "@/framework/agents/BaseAgent";
import { SupabaseOperator } from "@/operators/SupabaseOperator";

/**
 * Interface for the properties required by the ProofReadingAgent.
 */
interface ProofReadingAgentProps extends BaseAgentProps {
	instructions: string;
	content: string;
}

/**
 * ProofReadingAgent is responsible for proofreading content based on given instructions.
 * It extends the BaseAgent and utilizes AI models to perform proofreading tasks.
 */
class ProofReadingAgent extends BaseAgent {
	/**
	 * Constructs a new ProofReadingAgent instance.
	 * @param props - The properties required to initialize the agent, including instructions and content.
	 */
	constructor(props: ProofReadingAgentProps) {
		super(props);
		this.prompt = AIPrompt.loadPrompt(proofReadingPrompt, [
			{ instructions: props.instructions },
			{ content: props.content },
			{ date: new Date().toISOString() },
		]);
		this.config = {
			...this.config,
			...props,
		};
		console.log(
			`ProofReadingAgent initiated with the following config: ${
				JSON.stringify(props, null, 2)
			}`,
		);
	}

	/**
	 * Executes the proofreading process.
	 * Initializes the Conductor with the appropriate operator and model,
	 * starts a conversation, adds the initial message, conducts the conversation,
	 * and returns the final output.
	 * @returns The final proofread content.
	 */
	async run() {
		const operator = new SupabaseOperator({
			taskId: this.taskId,
			tools: getResearchToolsPackage(),
		});

		this.conductor = new Conductor({
			operator: operator,
			defaultModel: this.config.model ?? AI_MODELS.CHATGPT4O,
			stateSerializer: this.config.serializer,
		});

		await this.conductor.startConversation();

		const firstMessage = new HumanMessage(this.prompt);

		await this.conductor.addMessages([firstMessage]);

		await this.conductor.conduct();

		const finalOutput = await this.conductor.getFinalOutput();

		return finalOutput;
	}
}

/**
 * The prompt template used by the ProofReadingAgent to guide the proofreading process.
 */
const proofReadingPrompt = `
You are a professional proofreader with extensive experience in editorial work. Your task is to:

1. Carefully review the provided writing instructions to understand the original requirements and context.
Read the submitted content thoroughly, focusing on:
- Grammar and spelling
- Punctuation and formatting
- Clarity and coherence
- Adherence to the original instructions
- Style consistency
- Technical accuracy
- Flow and readability

3. Create a structured list of necessary changes.

4. Apply these changes systematically to produce an improved version.

5. Perform a final review of the revised content to ensure all improvements are properly implemented.

6. Format the final output in clean markdown, ensuring no escape characters or special formatting symbols are visible.

Important Guidelines:
- Do not ask questions or seek clarification
- Do not explain your changes or reasoning
- Do not include any meta-commentary or notes
- Output only the final, polished content in markdown format
- Ensure the output maintains all intended formatting while being free of visible markup or escape characters
- Preserve the original meaning and intent while improving the technical aspects of the writing

Original writing instructions given to the writer:
{original_instructions}

Content to proofread:
{content_to_proofread}
`;

export default ProofReadingAgent;
