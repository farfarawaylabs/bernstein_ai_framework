CREATE TABLE "public"."tool_calls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL primary key,
    "task_id" "uuid" references public.tasks(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "type" "text" NOT NULL,
    "call" "jsonb" NOT NULL,
    "result" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

create index tool_calls_task_id_idx on tool_calls (task_id);

ALTER TABLE "public"."tool_calls" OWNER TO "postgres";

ALTER TABLE "public"."tool_calls" ENABLE ROW LEVEL SECURITY;
