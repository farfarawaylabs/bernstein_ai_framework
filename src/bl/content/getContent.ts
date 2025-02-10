import { SupabaseSerializer } from "@/framework/state/SupabaseSerializer";
import { ProducedContent } from "@/models/ProducedContent";

export async function getContent(
	id: string,
	includeRawConversation: boolean = false,
) {
	const serializer = new SupabaseSerializer(
		"6024d23d-0857-4eee-8274-bf20ef2124a0",
	);
	const conversation = await serializer.load(id);

	const producedContent = new ProducedContent(conversation);

	return {
		...producedContent.produceContent(),
		rawConversation: includeRawConversation
			? conversation.serializeState()
			: undefined,
	};
}
