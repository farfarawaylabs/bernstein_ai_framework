import { getDBClient } from "../dl_common";

export async function getContentById(id: string) {
    const db = getDBClient();

    const { data, error } = await db.from("content").select("*").eq("id", id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
