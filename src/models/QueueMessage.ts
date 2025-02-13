export interface QueueMessage {
    type: "generate_content" | "revise_content";
    data: any;
}
