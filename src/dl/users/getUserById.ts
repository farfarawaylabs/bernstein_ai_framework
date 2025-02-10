import { getDBClient } from "../dl_common";

export async function getUserById(userId: string) {
    const db = getDBClient();

    const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId);

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
}
