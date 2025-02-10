import { getDBClient } from "../dl_common";

export async function getNumberOfTasksPerUserPerDay(
    userId: string,
    day: Date,
) {
    const db = getDBClient();
    const { data, error } = await db
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", day.toISOString())
        .lt(
            "created_at",
            new Date(day.setDate(day.getDate() + 1)).toISOString(),
        );

    if (error) {
        throw new Error(error.message);
    }

    return data.length;
}
