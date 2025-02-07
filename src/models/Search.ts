export interface SearchSource {
	title: string;
	url: string;
}

export interface SearchResult {
	answer: string;
	sources: SearchSource[];
}

export interface SearchWithSchemaResult {
	answer: any;
	sources: SearchSource[];
}

export interface NewsSearchResult {
	sources: SearchSource[];
	headlines: {
		title: string;
		summary: string;
	}[];
}
