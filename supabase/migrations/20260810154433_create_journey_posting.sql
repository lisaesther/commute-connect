-- CommuteConnect journey-posting foundation.
--
-- This migration:
--   1. Enables PostGIS in a dedicated schema.
--   2. Creates the journeys table.
--   3. Separates private pickup/drop-off information.
--   4. Enforces driver and vehicle readiness.
--   5. Adds spatial and relational indexes.
--   6. Enables RLS and least-privilege access.
--   7. Provides one atomic RPC for creating journeys.

begin;

-- ============================================================
-- 1. POSTGIS
-- ============================================================

create schema if not exists gis;

create extension if not exists postgis
with schema gis;


-- ============================================================
-- 1A. VEHICLE OWNERSHIP KEY
-- ============================================================

alter table public.vehicles
  add constraint vehicles_id_owner_id_unique
  unique (id, owner_id);

-- ============================================================
-- 2. JOURNEYS
-- ============================================================

create table public.journeys (
  id uuid primary key default gen_random_uuid(),

  driver_id uuid not null
    references public.profiles(id)
    on delete cascade,

  vehicle_id uuid not null,

  origin_name text not null,
  origin_location gis.geography(Point, 4326) not null,

  destination_name text not null,
  destination_location gis.geography(Point, 4326) not null,

  departure_at timestamptz not null,

  departure_flexibility_minutes smallint not null default 0,

  seats_offered smallint not null,

  suggested_contribution numeric(6, 2),

  luggage_preference text not null default 'small',
  pets_preference text not null default 'no',
  smoking_allowed boolean not null default false,

  notes text,

  status text not null default 'open',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,

  constraint journeys_vehicle_belongs_to_driver
    foreign key (vehicle_id, driver_id)
    references public.vehicles(id, owner_id),

  constraint journeys_origin_name_length
    check (
      char_length(btrim(origin_name)) between 2 and 300
    ),

  constraint journeys_destination_name_length
    check (
      char_length(btrim(destination_name)) between 2 and 300
    ),

  constraint journeys_departure_flexibility_valid
    check (
      departure_flexibility_minutes in (0, 15, 30, 60)
    ),

  constraint journeys_seats_offered_valid
    check (
      seats_offered between 1 and 8
    ),

  constraint journeys_contribution_valid
    check (
      suggested_contribution is null
      or (
        suggested_contribution >= 0
        and suggested_contribution <= 100
      )
    ),

  constraint journeys_luggage_preference_valid
    check (
      luggage_preference in ('none', 'small', 'medium', 'large')
    ),

  constraint journeys_pets_preference_valid
    check (
      pets_preference in ('no', 'yes', 'ask')
    ),

  constraint journeys_notes_length
    check (
      notes is null
      or char_length(notes) <= 500
    ),

  constraint journeys_status_valid
    check (
      status in ('open', 'cancelled', 'completed')
    ),

  constraint journeys_cancellation_consistent
    check (
      (
        status = 'cancelled'
        and cancelled_at is not null
      )
      or
      (
        status <> 'cancelled'
        and cancelled_at is null
      )
    )
);


comment on table public.journeys is
  'Journeys posted by CommuteConnect drivers. Contains searchable journey information but not private pickup or drop-off instructions.';

comment on column public.journeys.origin_location is
  'Approximate journey origin stored as a WGS84 PostGIS geography point.';

comment on column public.journeys.destination_location is
  'Approximate journey destination stored as a WGS84 PostGIS geography point.';

comment on column public.journeys.seats_offered is
  'Original number of passenger seats offered by the driver. Remaining availability will later be derived from accepted bookings.';


-- ============================================================
-- 3. PRIVATE JOURNEY DETAILS
-- ============================================================

create table public.journey_private_details (
  journey_id uuid primary key
    references public.journeys(id)
    on delete cascade,

  pickup_details text,
  dropoff_details text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint journey_private_pickup_length
    check (
      pickup_details is null
      or char_length(pickup_details) <= 500
    ),

  constraint journey_private_dropoff_length
    check (
      dropoff_details is null
      or char_length(dropoff_details) <= 500
    )
);


comment on table public.journey_private_details is
  'Private journey coordination information. Currently readable only by the journey driver; accepted passengers may receive controlled access in a future booking migration.';


-- ============================================================
-- 4. DRIVER / VEHICLE BUSINESS-RULE VALIDATION
-- ============================================================

create or replace function public.validate_journey_driver_vehicle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_role text;
  profile_completed timestamptz;

  vehicle_owner uuid;
  vehicle_capacity smallint;
  vehicle_active boolean;
  vehicle_declaration timestamptz;
begin
  select
    p.role,
    p.profile_completed_at
  into
    profile_role,
    profile_completed
  from public.profiles p
  where p.id = new.driver_id;

  if not found then
    raise exception 'A valid driver profile is required.';
  end if;

  if profile_role not in ('driver', 'both') then
    raise exception 'Only users configured to offer rides can post journeys.';
  end if;

  if profile_completed is null then
    raise exception 'Complete your profile before posting a journey.';
  end if;

  select
    v.owner_id,
    v.passenger_seats,
    v.is_active,
    v.driver_declaration_accepted_at
  into
    vehicle_owner,
    vehicle_capacity,
    vehicle_active,
    vehicle_declaration
  from public.vehicles v
  where v.id = new.vehicle_id;

  if not found then
    raise exception 'The selected vehicle does not exist.';
  end if;

  if vehicle_owner <> new.driver_id then
    raise exception 'The selected vehicle does not belong to this driver.';
  end if;

  if vehicle_active is not true then
    raise exception 'The selected vehicle is not active.';
  end if;

  if vehicle_declaration is null then
    raise exception 'Driver declaration must be accepted before posting a journey.';
  end if;

  if new.seats_offered > vehicle_capacity then
    raise exception
      'Seats offered cannot exceed the selected vehicle capacity of %.',
      vehicle_capacity;
  end if;

  if tg_op = 'INSERT' then
    if new.departure_at <= now() then
      raise exception 'Journey departure must be in the future.';
    end if;
  elsif new.departure_at is distinct from old.departure_at then
    if new.departure_at <= now() then
      raise exception 'Journey departure must be in the future.';
    end if;
  end if;

  return new;
end;
$$;


create trigger journeys_validate_insert
before insert on public.journeys
for each row
execute function public.validate_journey_driver_vehicle();


create trigger journeys_validate_important_updates
before update of
  driver_id,
  vehicle_id,
  seats_offered,
  departure_at
on public.journeys
for each row
execute function public.validate_journey_driver_vehicle();


-- ============================================================
-- 5. UPDATED-AT TRIGGERS
-- ============================================================

create trigger journeys_set_updated_at
before update on public.journeys
for each row
execute function public.set_updated_at();


create trigger journey_private_details_set_updated_at
before update on public.journey_private_details
for each row
execute function public.set_updated_at();


-- ============================================================
-- 6. INDEXES
-- ============================================================

create index journeys_driver_id_idx
  on public.journeys(driver_id);

create index journeys_vehicle_id_idx
  on public.journeys(vehicle_id);

create index journeys_status_departure_idx
  on public.journeys(status, departure_at);

create index journeys_origin_location_gix
  on public.journeys
  using gist(origin_location);

create index journeys_destination_location_gix
  on public.journeys
  using gist(destination_location);


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table public.journeys
enable row level security;

alter table public.journey_private_details
enable row level security;


create policy "Drivers can read their own journeys"
on public.journeys
for select
to authenticated
using (
  (select auth.uid()) = driver_id
);


create policy "Drivers can read their own private journey details"
on public.journey_private_details
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_private_details.journey_id
      and j.driver_id = (select auth.uid())
  )
);


-- ============================================================
-- 8. TABLE PRIVILEGES
-- ============================================================

-- Creation is intentionally not granted directly.
-- Journeys will be created through the controlled RPC below.

revoke all
on table public.journeys
from anon, authenticated;

revoke all
on table public.journey_private_details
from anon, authenticated;


-- Drivers may read safe information from their own journey rows.
-- Geographic coordinates are deliberately not directly exposed.

grant select (
  id,
  driver_id,
  vehicle_id,
  origin_name,
  destination_name,
  departure_at,
  departure_flexibility_minutes,
  seats_offered,
  suggested_contribution,
  luggage_preference,
  pets_preference,
  smoking_allowed,
  notes,
  status,
  created_at,
  updated_at,
  cancelled_at
)
on public.journeys
to authenticated;


grant select
on public.journey_private_details
to authenticated;


-- ============================================================
-- 9. ATOMIC JOURNEY CREATION RPC
-- ============================================================

create or replace function public.create_journey(
  p_vehicle_id uuid,

  p_origin_name text,
  p_origin_lat double precision,
  p_origin_lng double precision,

  p_destination_name text,
  p_destination_lat double precision,
  p_destination_lng double precision,

  p_departure_at timestamptz,
  p_departure_flexibility_minutes smallint,

  p_seats_offered smallint,
  p_suggested_contribution numeric,

  p_luggage_preference text,
  p_pets_preference text,
  p_smoking_allowed boolean,

  p_notes text,

  p_pickup_details text,
  p_dropoff_details text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_driver_id uuid;
  new_journey_id uuid;
begin
  current_driver_id := auth.uid();

  if current_driver_id is null then
    raise exception 'Authentication is required.';
  end if;

  if char_length(btrim(coalesce(p_origin_name, ''))) < 2 then
    raise exception 'A valid origin is required.';
  end if;

  if char_length(btrim(coalesce(p_destination_name, ''))) < 2 then
    raise exception 'A valid destination is required.';
  end if;

  if p_origin_lat is null
     or p_origin_lat < -90
     or p_origin_lat > 90 then
    raise exception 'Origin latitude is invalid.';
  end if;

  if p_origin_lng is null
     or p_origin_lng < -180
     or p_origin_lng > 180 then
    raise exception 'Origin longitude is invalid.';
  end if;

  if p_destination_lat is null
     or p_destination_lat < -90
     or p_destination_lat > 90 then
    raise exception 'Destination latitude is invalid.';
  end if;

  if p_destination_lng is null
     or p_destination_lng < -180
     or p_destination_lng > 180 then
    raise exception 'Destination longitude is invalid.';
  end if;

  if p_origin_lat = p_destination_lat
     and p_origin_lng = p_destination_lng then
    raise exception 'Origin and destination must be different locations.';
  end if;

  insert into public.journeys (
    driver_id,
    vehicle_id,

    origin_name,
    origin_location,

    destination_name,
    destination_location,

    departure_at,
    departure_flexibility_minutes,

    seats_offered,
    suggested_contribution,

    luggage_preference,
    pets_preference,
    smoking_allowed,

    notes,
    status
  )
  values (
    current_driver_id,
    p_vehicle_id,

    btrim(p_origin_name),
    gis.st_setsrid(
      gis.st_makepoint(p_origin_lng, p_origin_lat),
      4326
    )::gis.geography,

    btrim(p_destination_name),
    gis.st_setsrid(
      gis.st_makepoint(p_destination_lng, p_destination_lat),
      4326
    )::gis.geography,

    p_departure_at,
    p_departure_flexibility_minutes,

    p_seats_offered,
    p_suggested_contribution,

    p_luggage_preference,
    p_pets_preference,
    p_smoking_allowed,

    nullif(btrim(coalesce(p_notes, '')), ''),
    'open'
  )
  returning id
  into new_journey_id;


  insert into public.journey_private_details (
    journey_id,
    pickup_details,
    dropoff_details
  )
  values (
    new_journey_id,
    nullif(btrim(coalesce(p_pickup_details, '')), ''),
    nullif(btrim(coalesce(p_dropoff_details, '')), '')
  );


  return new_journey_id;
end;
$$;


-- Trigger functions should not be invoked directly.

revoke all
on function public.validate_journey_driver_vehicle()
from public, anon, authenticated;


-- The journey-creation RPC is the only authenticated creation path.

revoke all
on function public.create_journey(
  uuid,
  text,
  double precision,
  double precision,
  text,
  double precision,
  double precision,
  timestamptz,
  smallint,
  smallint,
  numeric,
  text,
  text,
  boolean,
  text,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.create_journey(
  uuid,
  text,
  double precision,
  double precision,
  text,
  double precision,
  double precision,
  timestamptz,
  smallint,
  smallint,
  numeric,
  text,
  text,
  boolean,
  text,
  text,
  text
)
to authenticated;

commit;
