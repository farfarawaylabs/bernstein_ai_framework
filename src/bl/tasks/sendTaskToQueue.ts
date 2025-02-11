import { AsyncTask } from "@/models/AsyncTask";
import Environment from "@/utils/environment";

export async function sendTaskToQueue(task: AsyncTask) {
    await Environment.CONTENT_GENERATION_QUEUE.send({
        type: "generate_content",
        data: task,
    });
}
