import { getNumberOfTasksPerUserPerDay } from "@/dl/tasks/getNumberOfTasksPerUserPerDay";
import { getUser } from "./getUser";

export async function getUserLeftAllowence(userId: string) {
    const promisses = [
        getUser(userId),
        getNumberOfTasksPerUserPerDay(
            userId,
            new Date(new Date().setHours(0, 0, 1, 0)),
        ),
    ];

    const [user, numberOfDailyTasksUsed] = await Promise.all(promisses) as [
        { daily_usage_limit: number },
        number,
    ];

    return user.daily_usage_limit! - numberOfDailyTasksUsed;
}
