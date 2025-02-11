import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { ProducedContent } from "@/models/ProducedContent";

export async function getContent(
	id: string,
	includeRawConversation: boolean = true,
) {
	const serializer = new SupabaseSerializer("");
	const conversation = await serializer.load(id);

	const producedContent = new ProducedContent(conversation);

	return {
		...producedContent.produceContent(),
		rawConversation: includeRawConversation
			? conversation.serializeState()
			: undefined,
	};
}
