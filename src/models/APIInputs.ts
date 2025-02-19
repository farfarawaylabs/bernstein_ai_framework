export interface GenerateResearchReportInput {
	topic: string;
	instructions: string;
}

export interface GenerateBlogPostInput {
	topic: string;
	toneOfVoice: string;
	instructions: string;
}

export interface GenerateArticleInput {
	topic: string;
	toneOfVoice: string;
	instructions: string;
}

export interface GenerateGenericWritingInput {
	instructions: string;
}

export interface GetContentByTaskInput {
	taskId: string;
	getToolCallsHistory: boolean;
	includeRawConversation: boolean;
}

export interface ReviseTaskInput {
	instructions: string;
}

export interface FeedbackTaskInput {
	feedback: boolean;
}
