import { Conversation } from "./conversation";
import { ConversationSerializer } from "./baseConversationSerializer";
import { saveConversation } from "@/dl/conversations/dl_saveConversation";
import { getConversation } from "@/dl/conversations/dl_getConversation";

/**
 * SupabaseSerializer is a concrete implementation of the ConversationSerializer
 * that interacts with Supabase to persist and retrieve conversation data.
 */
export class SupabaseSerializer extends ConversationSerializer {
    private userId: string;

    /**
     * Constructs a new SupabaseSerializer instance.
     * @param userId - The ID of the user associated with the conversation.
     */
    constructor(userId: string) {
        super();
        this.userId = userId;
    }

    /**
     * Saves a conversation to Supabase.
     * @param conversation - The conversation object to be saved.
     */
    async save(conversation: Conversation) {
        await saveConversation(conversation.id, this.userId, conversation);
    }

    /**
     * Loads a conversation from Supabase by its ID.
     * @param conversationId - The ID of the conversation to be loaded.
     * @returns A promise that resolves to the loaded conversation.
     */
    async load(conversationId: string): Promise<Conversation> {
        const conversation = await getConversation(conversationId);

        return conversation;
    }

    static async saveConversation(conversation: Conversation, userId: string) {
        await saveConversation(conversation.id, userId, conversation);
    }
}
