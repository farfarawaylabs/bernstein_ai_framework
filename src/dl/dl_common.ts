import Environment from "@/utils/environment";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

export function getDBClient() {
	return createClient<Database>(
		Environment.SUPABASE_URL,
		Environment.SUPABASE_PRIVATE_KEY,
	);
}
