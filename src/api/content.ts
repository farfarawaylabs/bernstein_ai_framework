import { getContent } from '@/bl/content/getContent';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/:id', async (c) => {
	const id = c.req.param('id');

	const content = await getContent(id);

	return c.json({ content });
});

export default app;
