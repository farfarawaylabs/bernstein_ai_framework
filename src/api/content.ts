import { getContent } from "@/bl/content/getContent";
import { getContentByTaskId } from "@/bl/content/getContentByTaskId";
import { GetContentByTaskInput } from "@/models/APIInputs";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const content = await getContent(id);

	return c.json({ content });
});

app.post("/getContentByTaskId", async (c) => {
	const body: GetContentByTaskInput = await c.req.json();

	const content = await getContentByTaskId(
		body.taskId,
		body.getToolCallsHistory,
		body.includeRawConversation,
	);

	return c.json({ content });
});

export default app;
