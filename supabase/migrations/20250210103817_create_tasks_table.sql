CREATE TABLE "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL primary key,
    "user_id" "uuid" NOT NULL references public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "conversation_id" "uuid" references public.conversations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "type" "text" NOT NULL DEFAULT 'generic',
    "status" "text" NOT NULL DEFAULT 'pending',
    "run_duration" bigint NOT NULL DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

create index tasks_user_id_idx on tasks (user_id);
create index tasks_conversation_id_idx on tasks (conversation_id);

ALTER TABLE "public"."tasks" OWNER TO "postgres";

ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
