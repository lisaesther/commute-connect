-- CommuteConnect controlled booking-request creation.
--
-- Booking requests are created through this SECURITY DEFINER RPC rather
-- than through direct authenticated INSERT privileges.
--
-- Passenger identity is derived from auth.uid().
-- The journey row is locked while eligibility and remaining capacity
-- are checked so that future capacity-sensitive operations can use the
-- same serialization point.

begin;


create or replace function public.create_booking_request(
  p_journey_id uuid,
  p_seats_requested smallint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;

  current_profile_role text;
  current_profile_completed_at timestamptz;

  target_driver_id uuid;
  target_status text;
  target_departure_at timestamptz;
  target_seats_offered smallint;

  accepted_seats integer := 0;
  remaining_seats integer := 0;

  active_request_exists boolean := false;

  new_booking_id uuid;
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

  if p_journey_id is null then
    raise exception 'Journey is required.';
  end if;


  if p_seats_requested is null
     or p_seats_requested < 1
     or p_seats_requested > 8 then
    raise exception 'Seats requested must be between 1 and 8.';
  end if;


  -- ==========================================================
  -- Passenger eligibility
  -- ==========================================================

  select
    p.role,
    p.profile_completed_at
  into
    current_profile_role,
    current_profile_completed_at
  from public.profiles p
  where p.id = current_user_id;


  if not found then
    raise exception 'A completed passenger profile is required.';
  end if;


  if current_profile_role not in ('passenger', 'both') then
    raise exception 'Your profile is not enabled for requesting rides.';
  end if;


  if current_profile_completed_at is null then
    raise exception 'Complete your profile before requesting a ride.';
  end if;


  -- ==========================================================
  -- Journey eligibility and serialization
  -- ==========================================================
  --
  -- Locking the journey gives booking creation and future booking
  -- acceptance a common serialization point for capacity-sensitive
  -- decisions.

  select
    j.driver_id,
    j.status,
    j.departure_at,
    j.seats_offered
  into
    target_driver_id,
    target_status,
    target_departure_at,
    target_seats_offered
  from public.journeys j
  where j.id = p_journey_id
  for update;


  if not found then
    raise exception 'Journey is not available for booking.';
  end if;


  if target_driver_id = current_user_id then
    raise exception 'You cannot request seats on your own journey.';
  end if;


  if target_status <> 'open' then
    raise exception 'Journey is not available for booking.';
  end if;


  if target_departure_at <= now() then
    raise exception 'Journey is not available for booking.';
  end if;


  -- ==========================================================
  -- Remaining capacity
  -- ==========================================================

  select
    coalesce(
      sum(br.seats_requested),
      0
    )::integer
  into accepted_seats
  from public.booking_requests br
  where br.journey_id = p_journey_id
    and br.status = 'accepted';


  remaining_seats :=
    target_seats_offered - accepted_seats;


  if remaining_seats < 0 then
    raise exception 'Journey capacity is inconsistent.';
  end if;


  if p_seats_requested > remaining_seats then
    raise exception 'Not enough seats remain for this request.';
  end if;


  -- ==========================================================
  -- Active-request duplication
  -- ==========================================================

  select exists (
    select 1
    from public.booking_requests br
    where br.journey_id = p_journey_id
      and br.passenger_id = current_user_id
      and br.status in (
        'pending',
        'accepted'
      )
  )
  into active_request_exists;


  if active_request_exists then
    raise exception 'You already have an active request for this journey.';
  end if;


  -- ==========================================================
  -- Create pending booking
  -- ==========================================================
  --
  -- The partial unique index remains the final protection against
  -- simultaneous duplicate submissions.

  begin
    insert into public.booking_requests (
      journey_id,
      passenger_id,
      seats_requested,
      status
    )
    values (
      p_journey_id,
      current_user_id,
      p_seats_requested,
      'pending'
    )
    returning id
    into new_booking_id;

  exception
    when unique_violation then
      raise exception 'You already have an active request for this journey.';
  end;


  return new_booking_id;
end;
$$;


comment on function public.create_booking_request(
  uuid,
  smallint
) is
  'Creates a pending booking request for the authenticated passenger after validating profile capability, journey eligibility, remaining accepted-seat capacity and active-request uniqueness.';


-- Functions in the public schema may otherwise inherit broad EXECUTE
-- permissions, so restrict execution explicitly.

revoke all
on function public.create_booking_request(
  uuid,
  smallint
)
from public, anon, authenticated;


grant execute
on function public.create_booking_request(
  uuid,
  smallint
)
to authenticated;


commit;
