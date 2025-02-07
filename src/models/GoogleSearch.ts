export interface GoogleSearchParameters {
	q: string;
	gl?: string;
	hl?: string;
	autocorrect?: boolean;
	page?: number;
	type: string;
	engine?: string;
}

export interface ShoppingItem {
	title: string;
	source: string;
	link: string;
	price: string;
	delivery: string;
	imageUrl: string;
	rating: number;
	ratingCount: number;
	offers: string;
	productId: string;
	position: number;
}

export interface GoogleShoppingResults {
	searchParameters: GoogleSearchParameters;
	shopping: ShoppingItem[];
}

interface KnowledgeGraphAttributes {
	[key: string]: string;
}

interface KnowledgeGraph {
	title: string;
	type: string;
	website: string;
	imageUrl: string;
	description: string;
	descriptionSource: string;
	descriptionLink: string;
	attributes: KnowledgeGraphAttributes;
}

interface Sitelink {
	title: string;
	link: string;
}

interface OrganicResult {
	title: string;
	link: string;
	snippet: string;
	sitelinks?: Sitelink[];
	position: number;
	attributes?: {
		[key: string]: string;
	};
	date?: string;
}

interface PeopleAlsoAskItem {
	question: string;
	snippet: string;
	title: string;
	link: string;
}

interface RelatedSearch {
	query: string;
}

export interface GoogleSearchResults {
	searchParameters: GoogleSearchParameters;
	knowledgeGraph?: KnowledgeGraph;
	organic: OrganicResult[];
	peopleAlsoAsk?: PeopleAlsoAskItem[];
	relatedSearches?: RelatedSearch[];
}
