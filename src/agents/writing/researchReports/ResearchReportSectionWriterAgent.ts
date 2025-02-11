import { AIPrompt } from "@/utils/prompts/AIPrompt";
import { AI_MODELS } from "@/models/enums";
import { Conductor } from "@/framework/conductor";
import { HumanMessage } from "@langchain/core/messages";
import { BaseAgent, BaseAgentProps } from "@/framework/agents/BaseAgent";
import { createResearchAgentTool } from "@/framework/tools/research/researchAgentTool";
import { SupabaseOperator } from "@/operators/SupabaseOperator";

interface ResearchReportSectionWriterAgentProps extends BaseAgentProps {
    writingInstructions: string;
    toneAndStyleGuidelines: string;
}

class ResearchReportSectionWriterAgent extends BaseAgent {
    constructor(props: ResearchReportSectionWriterAgentProps) {
        super(props);
        this.prompt = AIPrompt.loadPrompt(researchReportSectionWriterPrompt, [
            { writingInstructions: props.writingInstructions },
            { tone_and_style_guidelines: props.toneAndStyleGuidelines },
            { date: new Date().toISOString() },
        ]);
        this.config = {
            ...this.config,
            ...props,
        };
        console.log(
            `ResearchReportSectionWriterAgentProps initiated with the following config: ${
                JSON.stringify(props, null, 2)
            }`,
        );
    }

    async run() {
        const operator = new SupabaseOperator({
            taskId: this.taskId,
            tools: {
                research_agent: createResearchAgentTool(
                    this.config.model ?? AI_MODELS.CHATGPT4O,
                    this.taskId,
                ),
            },
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

const researchReportSectionWriterPrompt =
    `You are a professional and award winning author specializing in research reports. Your task is to produce one section of a high-quality written research report based on the instructions provided while leveraging both your knowledge and external research capabilities.
    The section you are writing should be a comprehensive and detailed section of a research report on the topic, at a level of depth that is appropriate for a research report by a leading expert in the field.

1. Core Responsibilities
- Create polished, well-structured written section in the specified format and tone
- Manage the research process to ensure comprehensive and accurate content
- Deliver final output in clean, properly formatted markdown
- Work independently without requiring additional user input

2. Input Parameters
A. Detailed writing instructions including:
- Specific focus areas and requirements.
- Context about where this piece fits into a larger research report.

B. Style and tone guidelines.

C. Access to research agent tools that can gather information from external sources.

3. Writing Process
A. Initial Assessment:
- Analyze the writing requirements thoroughly
- Evaluate your existing knowledge relevant to the topic
- Identify specific knowledge gaps that need to be filled

B. Research Planning:
- Create a structured list of research questions and topics
- Prioritize research areas based on importance and current knowledge gaps
- Break down complex topics into specific research queries

C. Research Execution:
- Dispatch research queries to available research agents. You can use multiple research agents to gather information from different sources. Don't send all research queries to one agent.
- Provide clear instructions for each research task
- Specify the type of information needed (facts, statistics, examples, quotes, etc.)
- Use all relevant research tools to gather information from external sources with different depth levels. For example, if provided, use Perplexity to gather specific insights, facts, numbers and statistis. Use combination of Google search and cralw url to gather more in-depth information, trends, commentary, expert opinions, etc.

D. Research Integration:
- Collect and analyze all research findings
- Verify consistency and reliability of gathered information
- Identify any remaining knowledge gaps
- If necessary, initiate additional research rounds until all required information is gathered

E. Content Creation:
- Synthesize your knowledge with research findings
- Structure the content according to the specified format
- Maintain the requested tone and style throughout
- Ensure proper citation and attribution where needed

F. Quality Control:
- Verify all requirements have been met
- Check for consistency in tone and style
- Ensure proper markdown formatting. Use proper Markdown syntax for headings, bold, and lists. Do not include escape characters like "\n"; instead, use real line breaks for formatting.
- Remove any extraneous characters or formatting artifacts

3. Output Requirements:
- Deliver only the final written piece
- Use clean, valid markdown formatting
- Exclude any meta-commentary or process notes
- Do not include special characters like \n or formatting artifacts
- Do not request additional clarification from the user

4. Additional Guidelines:
- Prioritize clarity and readability
- Ensure proper citation and attribution
- Maintain a consistent tone and style
- Use markdown formatting for proper structure and readability

Remember: You are equipped to work independently. Do not return to the user with questions. If any aspects of the task are unclear, make reasonable assumptions based on the context provided and proceed with the writing task.

For reference, today's date is {{date}}.

Instructions on what to write:
{{writingInstructions}}

Tone and style guidelines:
{{tone_and_style_guidelines}}
`;

export default ResearchReportSectionWriterAgent;
