CREATE OR REPLACE FUNCTION "private"."array_to_string_immutable"("arg" "text"[], "separator" "text", "null_string" "text" DEFAULT NULL::"text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    AS $$
select array_to_string(arg,separator,null_string) $$;

ALTER FUNCTION "private"."array_to_string_immutable"("arg" "text"[], "separator" "text", "null_string" "text") OWNER TO "postgres";