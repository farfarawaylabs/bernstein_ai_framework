import { Conductor } from "@/framework/conductor";
import { ConversationSerializer } from "@/framework/state/baseConversationSerializer";
import { KVStoreConversationSerializer } from "@/framework/state/KVSerializer";
import { AI_MODELS } from "@/models/enums";

/**
 * Interface for the properties required to initialize a BaseAgent.
 */
export interface BaseAgentProps {
	/** The AI model to be used by the agent. Defaults to CHATGPT4O. */
	model?: AI_MODELS;
	/** The serializer to be used for conversation state management. Defaults to KVStoreConversationSerializer. */
	serializer?: ConversationSerializer;
}

/**
 * Abstract class representing a base agent.
 * This class provides the foundational structure for creating AI agents
 * that can perform tasks, manage state, and interact with a conductor.
 */
export abstract class BaseAgent {
	/** Unique identifier for the agent instance. */
	agentId: string;
	/** The initial prompt or message for the agent. */
	protected prompt: string;
	/** The conductor responsible for managing the agent's tasks and state. */
	protected conductor: Conductor | undefined;
	/** Configuration object containing model and serializer settings. */
	protected config: any;

	/**
	 * Constructs a new BaseAgent instance.
	 * @param props - The properties to initialize the agent with.
	 */
	constructor(props: BaseAgentProps) {
		this.agentId = crypto.randomUUID();
		this.prompt = "";

		const {
			model = AI_MODELS.CHATGPT4O,
			serializer = new KVStoreConversationSerializer(60 * 60 * 24 * 1),
		} = props;

		this.config = { model, serializer };
	}

	/**
	 * Retrieves the conductor associated with the agent.
	 * @returns The conductor instance or undefined if not set.
	 */
	getConductor() {
		return this.conductor;
	}

	/**
	 * Abstract method to be implemented by subclasses to execute the agent's primary function.
	 * @returns A promise that resolves when the agent's task is complete.
	 */
	abstract run(): Promise<any>;
}
