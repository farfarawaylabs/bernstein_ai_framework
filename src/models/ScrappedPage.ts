export interface DocumentEmbeddings {
	content: string;
	embeddings: number[];
}

export interface ScrapedPage {
	url: string;
	cleanUrl: string;
	website: string;
	title?: string;
	fullHtml?: string;
	textualContent?: string;
	language?: string;
	excerpt?: string;
	summary?: string;
	topic?: string;
	subtopics?: string[];
	keywords?: string[];
	author?: string;
	publishTime?: number;
	imageUrl?: string;
	embeddings?: DocumentEmbeddings[];
	lastScrapedAt: string;
	lastScrapedAtNum: number;
}
