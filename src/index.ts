import { Hono } from 'hono';
import { cors } from 'hono/cors';
import initializeEnvironment from './api/middlewares/initializeEnvironment';
import tests from './api/tests';

const app = new Hono();

app.use('*', cors(), initializeEnvironment());

app.route('/tests', tests);

export default app;
