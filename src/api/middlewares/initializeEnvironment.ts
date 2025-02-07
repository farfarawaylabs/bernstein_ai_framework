import { createMiddleware } from 'hono/factory';
import { initializeEnvironment as initializeEnvironmentBL } from '@/utils/environment';

const initializeEnvironment = () => {
	return createMiddleware(async (c, next) => {
		initializeEnvironmentBL(c.env);

		await next();
	});
};

export default initializeEnvironment;
