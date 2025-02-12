import { deleteTask } from "@/bl/tasks/deleteTask";
import { getUserTasks } from "@/bl/tasks/getUserTasks";
import Environment from "@/utils/environment";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/tasks", async (c) => {
    const tasks = await getUserTasks(Environment.userId);

    return c.json({ tasks });
});

export default app;
