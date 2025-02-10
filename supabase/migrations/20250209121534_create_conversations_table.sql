CREATE TABLE "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL primary key,
    "user_id" "uuid" NOT NULL references public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "conversation_details" jsonb,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

create index conversations_user_id_idx on conversations (user_id);

ALTER TABLE "public"."conversations" OWNER TO "postgres";

ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
