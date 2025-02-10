import { Conversation } from "@/framework/state/conversation";

interface ToolsNames {
    writer: string;
    researcher: string;
    crawler: string;
}

const DEFAULT_TOOLS_NAMES: ToolsNames = {
    writer: "writer_agent",
    researcher: "research_agent",
    crawler: "crawl_url",
};

export class ProducedContent {
    rawConversation: Conversation;
    toolsNames: ToolsNames;

    constructor(rawConversation: Conversation, toolsNames?: ToolsNames) {
        this.rawConversation = rawConversation;
        this.toolsNames = { ...DEFAULT_TOOLS_NAMES, ...toolsNames };
    }

    produceContent() {
        return {
            finalContent: this.getFinalContent(),
            writingAgentsResponses: this.getAllWritingAgentsResponses(),
            researchAgentsResponses: this
                .getAllResearchAgentsResponses(),
            crawledUrls: this.getAllCrawledUrls(),
        };
    }

    getFinalContent() {
        return this.rawConversation.getLastMessage().content.toString();
    }

    getAllWritingAgentsResponses() {
        const writingToolCalls = this.rawConversation.getAllToolCallsWithName(
            this.toolsNames.writer,
        );
        const writingToolCallsResults = this.rawConversation
            .getAllToolCallsResults().filter((message) =>
                message.name === this.toolsNames.writer
            );

        // Now let's match answers to the tool calls based on the id
        const writing = [];
        for (const toolCall of writingToolCalls) {
            const answer = writingToolCallsResults.find((result) =>
                result.id === toolCall.id
            );
            if (answer) {
                writing.push({
                    instructions: JSON.stringify(toolCall.args),
                    answer: answer.content.toString(),
                });
            }
        }

        return writing;
    }

    getAllResearchAgentsResponses() {
        const researchToolCalls = this.rawConversation.getAllToolCallsWithName(
            this.toolsNames.researcher,
        );
        const researchToolCallsResults = this.rawConversation
            .getAllToolCallsResults().filter((message) =>
                message.name === this.toolsNames.researcher
            );

        const research = [];
        for (const toolCall of researchToolCalls) {
            const answer = researchToolCallsResults.find((result) =>
                result.id === toolCall.id
            );
            if (answer) {
                research.push({
                    instructions: toolCall.args,
                    answer: answer.content.toString(),
                });
            }
        }

        return research;
    }

    getAllCrawledUrls() {
        const crawledUrls = this.rawConversation.getAllToolCallsWithName(
            this.toolsNames.crawler,
        ).map((toolCall) => toolCall.args.url);

        return crawledUrls;
    }
}
