import { Hono } from "hono";
import { cors } from "hono/cors";
import initializeEnvironment from "./api/middlewares/initializeEnvironment";
import tests from "./api/tests";
import email from "./api/email";
import tasks from "./api/tasks";
import content from "./api/content";
import validateSession from "./api/middlewares/validateSession";

const app = new Hono();

app.use("*", cors(), initializeEnvironment());
app.use("/tasks/*", validateSession());
app.use("/content/*", validateSession());

app.route("/tests", tests);
app.route("/email", email);
app.route("/tasks", tasks);
app.route("/content", content);

export default app;
