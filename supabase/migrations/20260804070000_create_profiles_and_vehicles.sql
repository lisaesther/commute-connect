begin;

-- ============================================================
-- CommuteConnect profile schema
-- ============================================================
-- auth.users remains responsible for authentication.
-- public.profiles stores editable application profile data.
-- public.vehicles stores vehicles owned by users who offer rides.
-- ============================================================


-- ============================================================
-- Profiles
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users (id)
    on delete cascade,

  full_name text not null,

  role text not null default 'passenger',

  phone_e164 text,
  general_area text,
  bio text,

  organisation_name text,
  work_email text,
  organisation_verified_at timestamptz,

  prefer_same_organisation boolean not null default false,
  show_organisation boolean not null default false,

  gender_identity text,
  use_gender_for_matching boolean not null default false,
  prefer_same_gender boolean not null default false,

  profile_completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_full_name_length
    check (
      char_length(btrim(full_name)) between 2 and 100
    ),

  constraint profiles_role_valid
    check (
      role in ('passenger', 'driver', 'both')
    ),

  constraint profiles_phone_e164_valid
    check (
      phone_e164 is null
      or phone_e164 ~ '^\+[1-9][0-9]{7,14}$'
    ),

  constraint profiles_general_area_length
    check (
      general_area is null
      or char_length(btrim(general_area)) between 2 and 120
    ),

  constraint profiles_bio_length
    check (
      bio is null
      or char_length(bio) <= 500
    ),

  constraint profiles_organisation_name_length
    check (
      organisation_name is null
      or char_length(btrim(organisation_name)) between 2 and 120
    ),

  constraint profiles_work_email_valid
    check (
      work_email is null
      or (
        char_length(work_email) <= 254
        and work_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    ),

  constraint profiles_organisation_preference_valid
    check (
      not prefer_same_organisation
      or (
        organisation_name is not null
        and char_length(btrim(organisation_name)) > 0
      )
    ),

  constraint profiles_organisation_verification_valid
    check (
      organisation_verified_at is null
      or (
        organisation_name is not null
        and work_email is not null
      )
    ),

  constraint profiles_gender_identity_length
    check (
      gender_identity is null
      or char_length(btrim(gender_identity)) between 2 and 60
    ),

  constraint profiles_gender_matching_consent_valid
    check (
      not use_gender_for_matching
      or (
        gender_identity is not null
        and char_length(btrim(gender_identity)) > 0
      )
    ),

  constraint profiles_same_gender_preference_valid
    check (
      not prefer_same_gender
      or (
        use_gender_for_matching
        and gender_identity is not null
        and char_length(btrim(gender_identity)) > 0
      )
    )
);

comment on table public.profiles is
  'Private application profiles linked one-to-one with Supabase Auth users.';

comment on column public.profiles.phone_e164 is
  'Optional private phone number stored in E.164 international format.';

comment on column public.profiles.general_area is
  'Broad user area only. Exact residential addresses must not be stored here.';

comment on column public.profiles.organisation_verified_at is
  'Set only after a genuine organisation-verification process has succeeded.';

comment on column public.profiles.gender_identity is
  'Optional private information. It must not be inferred or publicly exposed.';

comment on column public.profiles.profile_completed_at is
  'Timestamp set when the user explicitly completes basic profile setup.';


-- ============================================================
-- Vehicles
-- ============================================================

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references public.profiles (id)
    on delete cascade,

  make text not null,
  model text not null,
  colour text not null,
  year smallint,
  passenger_seats smallint not null,

  accessibility_notes text,

  is_primary boolean not null default true,
  is_active boolean not null default true,

  driver_declaration_accepted_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vehicles_make_length
    check (
      char_length(btrim(make)) between 2 and 60
    ),

  constraint vehicles_model_length
    check (
      char_length(btrim(model)) between 1 and 60
    ),

  constraint vehicles_colour_length
    check (
      char_length(btrim(colour)) between 2 and 40
    ),

  constraint vehicles_year_valid
    check (
      year is null
      or year between 1900 and 2100
    ),

  constraint vehicles_passenger_seats_valid
    check (
      passenger_seats between 1 and 8
    ),

  constraint vehicles_accessibility_notes_length
    check (
      accessibility_notes is null
      or char_length(accessibility_notes) <= 500
    )
);

comment on table public.vehicles is
  'Vehicles owned by users who offer CommuteConnect journeys.';

comment on column public.vehicles.passenger_seats is
  'Available passenger capacity, excluding the driver seat.';

comment on column public.vehicles.driver_declaration_accepted_at is
  'Timestamp of the driver self-declaration. This is not formal licence or insurance verification.';


-- ============================================================
-- Indexes
-- ============================================================

create index vehicles_owner_id_idx
  on public.vehicles (owner_id);

create unique index vehicles_one_primary_per_owner_idx
  on public.vehicles (owner_id)
  where is_primary;


-- ============================================================
-- Clear organisation verification when verified details change
-- ============================================================

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

create trigger profiles_clear_organisation_verification
before update of organisation_name, work_email
on public.profiles
for each row
execute function public.clear_organisation_verification();

revoke execute
  on function public.clear_organisation_verification()
  from public, anon, authenticated;


-- ============================================================
-- Automatic updated_at timestamps
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();

revoke execute
  on function public.set_updated_at()
  from public, anon, authenticated;


-- ============================================================
-- Automatically create a profile after Auth registration
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    new.id,

    case
      when char_length(
        btrim(
          coalesce(
            new.raw_user_meta_data ->> 'full_name',
            ''
          )
        )
      ) between 2 and 100
      then btrim(new.raw_user_meta_data ->> 'full_name')
      else 'CommuteConnect user'
    end,

    case
      when new.raw_user_meta_data ->> 'role'
        in ('passenger', 'driver', 'both')
      then new.raw_user_meta_data ->> 'role'
      else 'passenger'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists commute_connect_create_profile
  on auth.users;

create trigger commute_connect_create_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

revoke execute
  on function public.handle_new_auth_user()
  from public, anon, authenticated;


-- ============================================================
-- Backfill profiles for existing Auth users
-- ============================================================

insert into public.profiles (
  id,
  full_name,
  role,
  created_at,
  updated_at
)
select
  auth_user.id,

  case
    when char_length(
      btrim(
        coalesce(
          auth_user.raw_user_meta_data ->> 'full_name',
          ''
        )
      )
    ) between 2 and 100
    then btrim(
      auth_user.raw_user_meta_data ->> 'full_name'
    )
    else 'CommuteConnect user'
  end,

  case
    when auth_user.raw_user_meta_data ->> 'role'
      in ('passenger', 'driver', 'both')
    then auth_user.raw_user_meta_data ->> 'role'
    else 'passenger'
  end,

  coalesce(auth_user.created_at, now()),
  now()

from auth.users as auth_user

on conflict (id) do nothing;


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles
  enable row level security;

alter table public.vehicles
  enable row level security;


-- Profile policies

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);


-- Vehicle policies

create policy "Users can read their own vehicles"
on public.vehicles
for select
to authenticated
using (
  (select auth.uid()) = owner_id
);

create policy "Users can create their own vehicles"
on public.vehicles
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
);

create policy "Users can update their own vehicles"
on public.vehicles
for update
to authenticated
using (
  (select auth.uid()) = owner_id
)
with check (
  (select auth.uid()) = owner_id
);

create policy "Users can delete their own vehicles"
on public.vehicles
for delete
to authenticated
using (
  (select auth.uid()) = owner_id
);


-- ============================================================
-- API privileges
-- ============================================================

-- Explicitly remove automatic public-schema privileges.
-- This keeps behaviour consistent across Supabase project defaults.

revoke all privileges
  on table public.profiles
  from anon, authenticated;

revoke all privileges
  on table public.vehicles
  from anon, authenticated;


-- Users may read their own complete profile through RLS.

grant select
  on table public.profiles
  to authenticated;


-- Users may update only editable profile fields.
-- Verification and audit fields are intentionally excluded.

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


-- Vehicle rows remain protected by owner-based RLS policies.

grant select, insert, update, delete
  on table public.vehicles
  to authenticated;


commit;
