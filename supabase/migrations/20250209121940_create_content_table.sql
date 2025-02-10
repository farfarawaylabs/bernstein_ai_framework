CREATE TABLE "public"."content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL primary key,
    "user_id" "uuid" NOT NULL references public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "conversation_id" "uuid" NOT NULL references public.conversations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

create index content_user_id_idx on content (user_id);
create index content_conversation_id_idx on content (conversation_id);

ALTER TABLE "public"."content" OWNER TO "postgres";

ALTER TABLE "public"."content" ENABLE ROW LEVEL SECURITY;
