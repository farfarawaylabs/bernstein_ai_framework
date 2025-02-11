import { Conversation } from "@/framework/state/conversation";
import { ToolCallsHistory } from "./ToolCallsHistory";

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
    toolCallsHistory: ToolCallsHistory;

    constructor(
        rawConversation: Conversation,
        toolsNames?: ToolsNames,
        toolCallsHistory?: ToolCallsHistory,
    ) {
        this.rawConversation = rawConversation;
        this.toolsNames = { ...DEFAULT_TOOLS_NAMES, ...toolsNames };
        this.toolCallsHistory = toolCallsHistory || { items: [] };
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
        if (this.toolCallsHistory.items.length > 0) {
            const writingToolCalls = this.toolCallsHistory.items.filter(
                (item) => item.type === this.toolsNames.writer,
            );

            const writingToolCallsResults = writingToolCalls.map((item) => {
                return {
                    instructions: JSON.stringify(item.callParams),
                    answer: item.response,
                };
            });

            return writingToolCallsResults;
        } else {
            const writingToolCalls = this.rawConversation
                .getAllToolCallsWithName(
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
    }

    getAllResearchAgentsResponses() {
        if (this.toolCallsHistory.items.length > 0) {
            const researchToolCalls = this.toolCallsHistory.items.filter(
                (item) => item.type === this.toolsNames.researcher,
            );

            const researchToolCallsResults = researchToolCalls.map((item) => {
                return {
                    instructions: JSON.stringify(item.callParams),
                    answer: item.response,
                };
            });

            return researchToolCallsResults;
        } else {
            const researchToolCalls = this.rawConversation
                .getAllToolCallsWithName(
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
    }

    getAllCrawledUrls() {
        console.log(this.toolsNames.crawler);
        if (this.toolCallsHistory.items.length > 0) {
            const crawledUrls = this.toolCallsHistory.items.filter(
                (item) => item.type === this.toolsNames.crawler,
            ).map((item) => item.callParams.args.url);

            return crawledUrls;
        } else {
            const crawledUrls = this.rawConversation.getAllToolCallsWithName(
                this.toolsNames.crawler,
            ).map((toolCall) => toolCall.args.url);

            return crawledUrls;
        }
    }
}
