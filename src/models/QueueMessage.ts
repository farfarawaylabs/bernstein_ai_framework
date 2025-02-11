export interface QueueMessage {
    type: "generate_content" | "other";
    data: any;
}
