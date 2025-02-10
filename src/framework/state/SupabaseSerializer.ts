import { Conversation } from "./conversation";
import { ConversationSerializer } from "./baseConversationSerializer";
import { saveConversation } from "@/dl/conversations/dl_saveConversation";
import { getConversation } from "@/dl/conversations/dl_getConversation";

export class SupabaseSerializer extends ConversationSerializer {
    private userId: string;

    constructor(userId: string) {
        super();
        this.userId = userId;
    }

    async save(conversation: Conversation) {
        await saveConversation(conversation.id, this.userId, conversation);
    }

    async load(conversationId: string): Promise<Conversation> {
        const conversation = await getConversation(conversationId);

        return conversation;
    }
}
