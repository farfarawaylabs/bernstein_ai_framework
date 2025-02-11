export interface ToolCallsHistoryItem {
    id: string;
    startedAt: string;
    type: string;
    callParams: Record<string, any>;
    response: string;
}

export interface ToolCallsHistory {
    items: ToolCallsHistoryItem[];
}
