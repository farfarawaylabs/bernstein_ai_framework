import { Hono } from "hono";
import Environment from "@/utils/environment";
import { generateCustomWritingTask } from "@/bl/tasks/generateGenericWritingTask";
import {
	FeedbackTaskInput,
	GenerateArticleInput,
	GenerateBlogPostInput,
	GenerateGenericWritingInput,
	GenerateResearchReportInput,
	ReviseTaskInput,
} from "@/models/APIInputs";
import { generateResearchReportTask } from "@/bl/tasks/generateResearchReportTask";
import { generateBlogPostTask } from "@/bl/tasks/generateBlogPostTask";
import { generateArticleTask } from "@/bl/tasks/generateArticleTask";
import { TONE_OF_VOICE } from "@/models/enums";
import { reviseTask } from "@/bl/tasks/reviseTask";
import { deleteTask } from "@/bl/tasks/deleteTask";
import { giveFeedback } from "@/bl/tasks/giveFeedbak";

const app = new Hono<{ Bindings: Env }>();

app.post("/generateResearchReport", async (c) => {
	const body: GenerateResearchReportInput = await c.req.json();
	const { topic, instructions } = body;

	const res = await generateResearchReportTask(
		Environment.userId,
		topic,
		instructions,
	);

	return c.json(res);
});

app.post("/generateBlogPost", async (c) => {
	const body: GenerateBlogPostInput = await c.req.json();
	const { topic, instructions, toneOfVoice } = body;

	const res = await generateBlogPostTask(
		Environment.userId,
		topic,
		toneOfVoice,
		instructions,
	);

	console.log("sending back response ", res);
	return c.json(res);
});

app.post("/generateArticle", async (c) => {
	const body: GenerateArticleInput = await c.req.json();
	const { topic, instructions, toneOfVoice } = body;

	const tone = toneOfVoice as keyof typeof TONE_OF_VOICE;
	const res = await generateArticleTask(
		Environment.userId,
		topic,
		TONE_OF_VOICE[tone],
		instructions,
	);

	return c.json(res);
});

app.post("/generateCustomWriting", async (c) => {
	const body: GenerateGenericWritingInput = await c.req.json();
	const { instructions } = body;

	const res = await generateCustomWritingTask(
		Environment.userId,
		instructions,
	);

	return c.json(res);
});

app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	await deleteTask(Environment.userId, id);
	return c.json({ success: true });
});

app.post("/:id/revise", async (c) => {
	const id = c.req.param("id");
	const body: ReviseTaskInput = await c.req.json();
	const { instructions } = body;

	await reviseTask(Environment.userId, id, instructions);

	return c.json({ success: true });
});

app.post("/:id/feedback", async (c) => {
	const id = c.req.param("id");
	const body: FeedbackTaskInput = await c.req.json();
	const { feedback } = body;

	await giveFeedback(Environment.userId, id, feedback);

	return c.json({ success: true });
});

export default app;
