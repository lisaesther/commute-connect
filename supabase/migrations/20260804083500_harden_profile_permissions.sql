begin;

-- Remove direct browser profile creation.
-- Profile rows are created automatically by the auth.users trigger.

drop policy if exists "Users can create their own profile"
  on public.profiles;


-- Clear organisation verification whenever the organisation
-- name or work email is changed.

create or replace function public.clear_organisation_verification()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.organisation_name is distinct from old.organisation_name
     or new.work_email is distinct from old.work_email
  then
    new.organisation_verified_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_clear_organisation_verification
  on public.profiles;

create trigger profiles_clear_organisation_verification
before update of organisation_name, work_email
on public.profiles
for each row
execute function public.clear_organisation_verification();

revoke execute
  on function public.clear_organisation_verification()
  from public, anon, authenticated;


-- Remove broad privileges inherited from the earlier migration.

revoke all privileges
  on table public.profiles
  from anon, authenticated;

revoke all privileges
  on table public.vehicles
  from anon, authenticated;


-- Users may read only their own profile through RLS.

grant select
  on table public.profiles
  to authenticated;


-- Users may update only legitimate editable profile fields.
-- Verification and audit fields are excluded.

grant update (
  full_name,
  role,
  phone_e164,
  general_area,
  bio,
  organisation_name,
  work_email,
  prefer_same_organisation,
  show_organisation,
  gender_identity,
  use_gender_for_matching,
  prefer_same_gender,
  profile_completed_at
)
  on table public.profiles
  to authenticated;


-- Vehicle operations remain protected by owner-based RLS.

grant select, insert, update, delete
  on table public.vehicles
  to authenticated;

commit;
