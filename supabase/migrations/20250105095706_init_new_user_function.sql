CREATE OR REPLACE FUNCTION "private"."init_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    new_profile_id uuid;
BEGIN
  INSERT INTO public.profiles(id, first_name, last_name, email, locale, vintage)
  VALUES (new.id, new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'lastName', new.email, new.raw_user_meta_data->>'locale', 'OG')
  RETURNING id INTO new_profile_id;

  RETURN NEW;
END$$;

ALTER FUNCTION "private"."init_new_user"() OWNER TO "postgres";

create trigger on_user_created
  after insert on auth.users
  for each row execute procedure private.init_new_user();