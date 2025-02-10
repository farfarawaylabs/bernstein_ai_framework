import { getDBClient } from "@/dl/dl_common";

export async function getSession(refreshToken: string, accessToken: string) {
    const res = await getDBClient().auth.setSession({
        refresh_token: refreshToken,
        access_token: accessToken,
    });

    return res;
}
