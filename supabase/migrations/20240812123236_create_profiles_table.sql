CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL primary key references auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "country" "text",
    "city" "text",
    "locale" "text",
    "vintage" "text" DEFAULT 'OG',
    "photo" "text",
    "daily_usage_limit" bigint NOT NULL DEFAULT 3,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
