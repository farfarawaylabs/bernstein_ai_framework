import { getSession } from "@/utils/auth/getSession";
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import Environment from "@/utils/environment";

const validateSession = () => {
    return createMiddleware(async (c, next) => {
        const refreshToken = c.req.header("x-refreshToken");
        const accessToken = c.req.header("x-accessToken");

        if (!refreshToken || !accessToken) {
            console.log(
                `Unauthorized: refreshToken: ${!refreshToken} accessToken: ${!accessToken}`,
            );
            throw new HTTPException(401, { message: "Unauthorized" });
        }

        const sessionData = await getSession(refreshToken, accessToken);

        if (
            !sessionData || !sessionData.data.user || !sessionData.data.session
        ) {
            console.log(
                `Unauthorized: sessionData: ${JSON.stringify(sessionData)}`,
            );
            throw new HTTPException(401, { message: "Unauthorized" });
        }

        Environment.userId = sessionData.data.user.id;

        console.log(`User ${Environment.userId} validated`);

        await next();
    });
};

export default validateSession;
