import { Hono } from "hono";
import { cors } from "hono/cors";
import initializeEnvironment from "./api/middlewares/initializeEnvironment";
import tests from "./api/tests";
import email from "./api/email";
import tasks from "./api/tasks";
import content from "./api/content";
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

const app = new Hono();

app.use("*", cors(), initializeEnvironment());
app.use("/tasks/*", validateSession());
//app.use("/content/*", validateSession());

app.route("/tests", tests);
app.route("/email", email);
app.route("/tasks", tasks);
app.route("/content", content);

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
                instructions: task.data.instructions,
                topic: task.data.topic,
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });

        default:
            return new WrittenContentEditorAgent({
                instructions: task.data.instructions,
                topic: "topic",
                model: AI_MODELS.CHATGPT4O,
                serializer: new SupabaseSerializer(
                    task.userId,
                ),
            });
    }
}

async function generateContent(task: AsyncTask) {
    const agent = getAgentForTask(task);

    const startTime = new Date();
    const response = await agent.run();
    const endTime = new Date();
    const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    await sendContentReadyEmail(
        task.data.email,
        task.data.topic,
        response.conversationId,
    );

    await updateTask(
        task.taskId,
        Math.round(durationInSeconds),
        TASK_STATUS.COMPLETED,
        response.conversationId,
    );
}
