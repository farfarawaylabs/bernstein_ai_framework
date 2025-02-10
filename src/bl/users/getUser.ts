import { getUserById } from "@/dl/users/getUserById";

export async function getUser(userId: string) {
    const user = await getUserById(userId);

    return user;
}
