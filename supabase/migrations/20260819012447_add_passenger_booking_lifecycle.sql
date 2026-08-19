-- CommuteConnect passenger booking lifecycle.
--
-- This migration:
--   1. evolves booking withdrawal semantics so both pending and
--      accepted requests may be withdrawn;
--   2. adds a safe passenger booking read model;
--   3. adds a controlled booking withdrawal RPC.
--
-- Applied migrations remain immutable.

begin;


-- ============================================================
-- 1. EVOLVE BOOKING LIFECYCLE CONSTRAINT
-- ============================================================
--
-- Previous behaviour allowed:
--
--   pending   -> withdrawn
--
-- Real booking behaviour must also allow:
--
--   accepted  -> withdrawn
--
-- An accepted booking already has responded_at populated, so the
-- withdrawn state must permit either:
--
--   responded_at is null
--
-- or:
--
--   responded_at <= withdrawn_at
--
-- This preserves the driver-response audit history.

alter table public.booking_requests
drop constraint booking_requests_lifecycle_valid;


alter table public.booking_requests
add constraint booking_requests_lifecycle_valid
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
    and withdrawn_at is not null
    and (
      responded_at is null
      or responded_at <= withdrawn_at
    )
  )
);


-- ============================================================
-- 2. PASSENGER BOOKING READ MODEL
-- ============================================================
--
-- This function deliberately avoids broadening direct access to
-- other users' profile data or private journey information.
--
-- Exact pickup and drop-off coordination details are returned only
-- while the caller has an accepted booking.

create or replace function public.get_passenger_bookings()
returns table (
  booking_request_id uuid,
  journey_id uuid,
  driver_name text,

  origin_name text,
  destination_name text,
  departure_at timestamptz,

  seats_requested smallint,
  booking_status text,
  journey_status text,

  suggested_contribution numeric,

  requested_at timestamptz,
  responded_at timestamptz,
  withdrawn_at timestamptz,

  pickup_details text,
  dropoff_details text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();


  -- ==========================================================
  -- Authentication
  -- ==========================================================

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;


  -- ==========================================================
  -- Safe passenger projection
  -- ==========================================================

  return query
  select
    br.id as booking_request_id,
    br.journey_id,

    driver_profile.full_name
      as driver_name,

    j.origin_name,
    j.destination_name,
    j.departure_at,

    br.seats_requested,
    br.status as booking_status,
    j.status as journey_status,

    j.suggested_contribution,

    br.created_at as requested_at,
    br.responded_at,
    br.withdrawn_at,

    case
      when br.status = 'accepted'
        then private_details.pickup_details
      else null
    end as pickup_details,

    case
      when br.status = 'accepted'
        then private_details.dropoff_details
      else null
    end as dropoff_details

  from public.booking_requests br

  inner join public.journeys j
    on j.id = br.journey_id

  inner join public.profiles driver_profile
    on driver_profile.id = j.driver_id

  left join public.journey_private_details private_details
    on private_details.journey_id = j.id

  where br.passenger_id = current_user_id

  order by
    case br.status
      when 'accepted' then 0
      when 'pending' then 1
      else 2
    end,

    j.departure_at asc,
    br.created_at desc;

end;
$$;


comment on function public.get_passenger_bookings() is
  'Returns only the authenticated passenger''s booking summaries. Exact pickup and drop-off coordination details are returned only for accepted bookings.';


revoke all
on function public.get_passenger_bookings()
from public, anon, authenticated;


grant execute
on function public.get_passenger_bookings()
to authenticated;


-- ============================================================
-- 3. CONTROLLED PASSENGER WITHDRAWAL
-- ============================================================
--
-- A passenger may withdraw:
--
--   pending  -> withdrawn
--   accepted -> withdrawn
--
-- Declined and already-withdrawn requests are historical states and
-- cannot be withdrawn again.
--
-- The journey row is locked using the same booking-then-journey lock
-- ordering used by driver booking responses. This serializes capacity
-- changes when an accepted booking is withdrawn.

create or replace function public.withdraw_booking_request(
  p_booking_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;

  target_passenger_id uuid;
  target_journey_id uuid;
  target_booking_status text;

  target_departure_at timestamptz;
begin
  current_user_id := auth.uid();


  -- ==========================================================
  -- Authentication
  -- ==========================================================

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;


  -- ==========================================================
  -- Input validation
  -- ==========================================================

  if p_booking_request_id is null then
    raise exception 'Booking request is required.';
  end if;


  -- ==========================================================
  -- Lock booking request
  -- ==========================================================

  select
    br.passenger_id,
    br.journey_id,
    br.status
  into
    target_passenger_id,
    target_journey_id,
    target_booking_status
  from public.booking_requests br
  where br.id = p_booking_request_id
  for update;


  if not found then
    raise exception 'Booking request is not available for withdrawal.';
  end if;


  if target_passenger_id <> current_user_id then
    raise exception 'Booking request is not available for withdrawal.';
  end if;


  if target_booking_status not in (
    'pending',
    'accepted'
  ) then
    raise exception 'Booking request cannot be withdrawn in its current state.';
  end if;


  -- ==========================================================
  -- Lock journey
  -- ==========================================================
  --
  -- Accepted withdrawals release journey capacity.
  --
  -- Locking the journey creates the same serialization point used
  -- when drivers accept booking requests, preventing inconsistent
  -- capacity calculations during concurrent operations.

  select
    j.departure_at
  into
    target_departure_at
  from public.journeys j
  where j.id = target_journey_id
  for update;


  if not found then
    raise exception 'Journey is not available.';
  end if;


  if target_departure_at <= now() then
    raise exception 'Bookings cannot be withdrawn after departure.';
  end if;


  -- Withdrawal is allowed even if a future journey has subsequently
  -- been cancelled. This preserves a passenger's ability to close
  -- their own booking lifecycle cleanly.


  -- ==========================================================
  -- Withdraw
  -- ==========================================================

  update public.booking_requests
  set
    status = 'withdrawn',
    withdrawn_at = now()
  where id = p_booking_request_id
    and passenger_id = current_user_id
    and status in (
      'pending',
      'accepted'
    );


  if not found then
    raise exception 'Booking request could not be withdrawn.';
  end if;

end;
$$;


comment on function public.withdraw_booking_request(
  uuid
) is
  'Allows the authenticated passenger to withdraw their own pending or accepted future booking request while preserving booking history. Accepted withdrawals release derived journey capacity.';


revoke all
on function public.withdraw_booking_request(
  uuid
)
from public, anon, authenticated;


grant execute
on function public.withdraw_booking_request(
  uuid
)
to authenticated;


commit;
