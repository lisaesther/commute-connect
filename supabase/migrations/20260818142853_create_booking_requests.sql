-- CommuteConnect booking / seat request foundation.
--
-- This migration introduces the booking request entity together with
-- lifecycle integrity, indexes, Row Level Security and least-privilege
-- table access.
--
-- Booking mutations will be added through controlled RPC functions.
-- Authenticated clients are not granted direct INSERT, UPDATE or DELETE.

begin;


-- ============================================================
-- 1. BOOKING REQUESTS
-- ============================================================

create table public.booking_requests (
  id uuid primary key
    default gen_random_uuid(),

  journey_id uuid not null
    references public.journeys (id)
    on delete cascade,

  passenger_id uuid not null
    references public.profiles (id)
    on delete cascade,

  seats_requested smallint not null,

  status text not null
    default 'pending',

  responded_at timestamptz,
  withdrawn_at timestamptz,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),


  constraint booking_requests_seats_requested_valid
    check (
      seats_requested between 1 and 8
    ),


  constraint booking_requests_status_valid
    check (
      status in (
        'pending',
        'accepted',
        'declined',
        'withdrawn'
      )
    ),


  -- Booking state and lifecycle timestamps must remain consistent.
  --
  -- pending:
  --   no driver response and no passenger withdrawal
  --
  -- accepted / declined:
  --   driver response timestamp required
  --
  -- withdrawn:
  --   withdrawal timestamp required

  constraint booking_requests_lifecycle_valid
    check (
      (
        status = 'pending'
        and responded_at is null
        and withdrawn_at is null
      )
      or
      (
        status in ('accepted', 'declined')
        and responded_at is not null
        and withdrawn_at is null
      )
      or
      (
        status = 'withdrawn'
        and responded_at is null
        and withdrawn_at is not null
      )
    )
);


comment on table public.booking_requests is
  'Seat requests made by authenticated passengers for driver-posted journeys. Booking history is retained through lifecycle status changes rather than ordinary deletion.';


comment on column public.booking_requests.seats_requested is
  'Number of seats requested by the passenger. Accepted bookings contribute to derived journey capacity usage.';


comment on column public.booking_requests.status is
  'Booking lifecycle state: pending, accepted, declined or withdrawn.';


-- ============================================================
-- 2. UPDATED-AT MAINTENANCE
-- ============================================================

create trigger booking_requests_set_updated_at
before update
on public.booking_requests
for each row
execute function public.set_updated_at();


-- ============================================================
-- 3. ACTIVE-REQUEST UNIQUENESS
-- ============================================================

-- A passenger may have at most one active request for a journey.
--
-- Historical declined or withdrawn requests are retained and do not
-- prevent a later request from being created.

create unique index booking_requests_one_active_per_passenger_journey
on public.booking_requests (
  journey_id,
  passenger_id
)
where status in (
  'pending',
  'accepted'
);


-- ============================================================
-- 4. QUERY INDEXES
-- ============================================================

-- Supports driver-side request retrieval and accepted-seat aggregation.

create index booking_requests_journey_status_idx
on public.booking_requests (
  journey_id,
  status
);


-- Supports passenger dashboard / booking-history retrieval.

create index booking_requests_passenger_status_created_idx
on public.booking_requests (
  passenger_id,
  status,
  created_at desc
);


-- Accepted bookings are queried frequently when deriving remaining
-- journey capacity.

create index booking_requests_accepted_journey_idx
on public.booking_requests (
  journey_id
)
where status = 'accepted';


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

alter table public.booking_requests
enable row level security;


-- Passengers may read only their own booking requests.

create policy "Passengers can read their own booking requests"
on public.booking_requests
for select
to authenticated
using (
  passenger_id = (select auth.uid())
);


-- Journey owners may read booking requests made against journeys
-- that they own.

create policy "Drivers can read booking requests for their journeys"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = booking_requests.journey_id
      and j.driver_id = (select auth.uid())
  )
);


-- ============================================================
-- 6. TABLE PRIVILEGES
-- ============================================================

-- Remove automatic public-schema privileges first.

revoke all privileges
on table public.booking_requests
from anon, authenticated;


-- Booking rows may be read only through the RLS rules above.
--
-- No direct INSERT, UPDATE or DELETE privileges are granted.
-- All booking mutations will use controlled SECURITY DEFINER RPCs.

grant select
on table public.booking_requests
to authenticated;


commit;
