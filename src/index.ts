import { Hono } from 'hono';
import { cors } from 'hono/cors';
import initializeEnvironment from './api/middlewares/initializeEnvironment';
import tests from './api/tests';
import email from './api/email';

const app = new Hono();

app.use('*', cors(), initializeEnvironment());

app.route('/tests', tests);
app.route('/email', email);
export default app;
