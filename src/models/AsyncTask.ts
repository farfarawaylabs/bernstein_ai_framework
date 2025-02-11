import { TASK_TYPES } from "./enums";

export interface AsyncTask {
    type: TASK_TYPES;
    taskId: string;
    userId: string;
    data: {
        email: string;
        topic: string;
        toneOfVoice: string;
        instructions: string;
    };
}
