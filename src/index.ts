import { Hono } from "hono";
import { cors } from "hono/cors";
import initializeEnvironment from "./api/middlewares/initializeEnvironment";
import tests from "./api/tests";
import email from "./api/email";
import tasks from "./api/tasks";
import content from "./api/content";
import users from "./api/users";
import validateSession from "./api/middlewares/validateSession";
import { initializeEnvironment as initializeEnvironmentBL } from "@/utils/environment";
import { Env } from "@/models/Env";
import { AsyncTask } from "./models/AsyncTask";
import { QueueMessage } from "./models/QueueMessage";
import { AI_MODELS, TASK_STATUS, TASK_TYPES } from "./models/enums";
import { ArticleWriterAgent } from "./agents/writing/articles/ArticleWriterAgent";
import { SupabaseSerializer } from "./framework/state/SupabaseSerializer";
import { sendContentReadyEmail } from "./utils/tasksHelpers";
import { updateTask } from "./dl/tasks/updateTask";
import { BlogPostWriterAgent } from "./agents/writing/blogs/blogPostWriterAgent";
import WrittenContentEditorAgent from "./agents/writing/generic/WrittenContentEditorAgent";
import ResearchReportAgent from "./agents/writing/researchReports/ResearchReportAgent";
import { Operator } from "./framework/operators";
import { Conductor } from "./framework/conductor";
import { getTask } from "./dl/tasks/getTask";
import { updateTaskStatus } from "./dl/tasks/updateTaskSTatus";
import {
    getResearchToolsPackage,
    getWritingToolsPackage,
} from "./framework/tools/toolPackages";
import { createResearchSectionWriterTool } from "./framework/tools/writing/research/researchSectionWriterTool";
import { SupabaseOperator } from "./operators/SupabaseOperator";

const app = new Hono();

app.use("*", cors(), initializeEnvironment());
app.use("/tasks/*", validateSession());
app.use("/users/*", validateSession());
//app.use("/content/*", validateSession());

app.route("/tests", tests);
app.route("/email", email);
app.route("/tasks", tasks);
app.route("/content", content);
app.route("/users", users);

export default {
    fetch: app.fetch,
    async queue(batch: MessageBatch<unknown>, env: Env) {
        initializeEnvironmentBL(env);

        console.log("Received batch of messages:", batch.messages.length);

        for (const message of batch.messages) {
            const task = message.body as QueueMessage;

            switch (task.type) {
                case "generate_content":
                    await generateContent(task.data);
                    break;

                case "revise_content":
                    await reviseContent(task.data.userId, task.data);
                    break;

                default:
                    console.error(`Unknown task type: ${task.type}`);
                    break;
            }
        }
    },
};

function getAgentForTask(task: AsyncTask) {
    switch (task.type) {
        case TASK_TYPES.ARTICLE:
            return new ArticleWriterAgent({
                taskId: task.taskId,
                instructions: task.data.instructions,
                topic: task.data.topic,
                toneOfVoice: task.data.toneOfVoice,
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });

        case TASK_TYPES.BLOG_POST:
            return new BlogPostWriterAgent({
                taskId: task.taskId,
                instructions: task.data.instructions,
                topic: task.data.topic,
                toneOfVoice: task.data.toneOfVoice,
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });

        case TASK_TYPES.RESEARCH_REPORT:
            return new ResearchReportAgent({
                taskId: task.taskId,
                instructions: task.data.instructions,
                topic: task.data.topic,
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });

        default:
            return new WrittenContentEditorAgent({
                taskId: task.taskId,
                instructions: task.data.instructions,
                topic: "topic",
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });
    }
}

const getToolsForTaskType = (task: AsyncTask) => {
    switch (task.type) {
        case TASK_TYPES.ARTICLE:
            return { ...getResearchToolsPackage() };

        case TASK_TYPES.BLOG_POST:
            return { ...getResearchToolsPackage() };

        case TASK_TYPES.RESEARCH_REPORT:
            return {
                research_section_writer_agent: createResearchSectionWriterTool(
                    AI_MODELS.CHATGPT4O,
                    task.taskId,
                ),
            };

        default:
            return {
                ...getResearchToolsPackage(),
                ...getWritingToolsPackage(
                    AI_MODELS.CHATGPT4O,
                    task.taskId,
                ),
            };
    }
};

async function generateContent(task: AsyncTask) {
    const agent = getAgentForTask(task);

    const startTime = new Date();
    const response = await agent.run();
    const endTime = new Date();
    const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    await sendContentReadyEmail(
        task.data.email,
        task.data.topic,
        task.taskId,
    );

    await updateTask(
        task.taskId,
        Math.round(durationInSeconds),
        TASK_STATUS.COMPLETED,
        response.conversationId,
    );
}

async function reviseContent(userId: string, task: AsyncTask) {
    const taskData = await getTask(task.taskId);

    await updateTaskStatus(
        task.taskId,
        TASK_STATUS.IN_PROGRESS,
    );

    const operator = new SupabaseOperator({
        taskId: task.taskId,
        tools: getToolsForTaskType(task),
    });

    const conductor = new Conductor({
        operator: operator,
        defaultModel: AI_MODELS.CHATGPT4O,
        stateSerializer: new SupabaseSerializer(
            userId,
        ),
        conversationId: taskData.conversation_id!,
    });
    await conductor.conduct();

    await sendContentReadyEmail(
        task.data.email,
        task.data.topic,
        task.taskId,
    );

    await updateTaskStatus(
        task.taskId,
        TASK_STATUS.COMPLETED,
    );
}
