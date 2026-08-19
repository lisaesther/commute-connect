-- CommuteConnect controlled driver response to booking requests.
--
-- Only the authenticated owner of the corresponding journey may
-- accept or decline a pending request.
--
-- Acceptance is capacity-sensitive. The journey row is locked before
-- accepted-seat capacity is recalculated so simultaneous acceptance
-- attempts cannot overbook the journey.

begin;


create or replace function public.respond_to_booking_request(
  p_booking_request_id uuid,
  p_response text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;

  target_journey_id uuid;
  target_booking_status text;
  target_seats_requested smallint;

  target_driver_id uuid;
  target_journey_status text;
  target_departure_at timestamptz;
  target_seats_offered smallint;

  accepted_seats integer := 0;
  remaining_seats integer := 0;
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


  if p_response is null
     or p_response not in (
       'accepted',
       'declined'
     ) then
    raise exception 'Response must be accepted or declined.';
  end if;


  -- ==========================================================
  -- Lock booking request
  -- ==========================================================
  --
  -- The request itself is locked so two response operations cannot
  -- transition the same pending request simultaneously.

  select
    br.journey_id,
    br.status,
    br.seats_requested
  into
    target_journey_id,
    target_booking_status,
    target_seats_requested
  from public.booking_requests br
  where br.id = p_booking_request_id
  for update;


  if not found then
    raise exception 'Booking request is not available for response.';
  end if;


  if target_booking_status <> 'pending' then
    raise exception 'Booking request has already been resolved.';
  end if;


  -- ==========================================================
  -- Lock journey and verify driver ownership
  -- ==========================================================
  --
  -- The journey row is the common serialization point for
  -- capacity-sensitive booking operations.

  select
    j.driver_id,
    j.status,
    j.departure_at,
    j.seats_offered
  into
    target_driver_id,
    target_journey_status,
    target_departure_at,
    target_seats_offered
  from public.journeys j
  where j.id = target_journey_id
  for update;


  if not found then
    raise exception 'Journey is not available.';
  end if;


  if target_driver_id <> current_user_id then
    raise exception 'You cannot respond to another driver''s booking request.';
  end if;


  if target_journey_status <> 'open'
     or target_departure_at <= now() then
    raise exception 'Journey is no longer available for booking responses.';
  end if;


  -- ==========================================================
  -- Decline
  -- ==========================================================

  if p_response = 'declined' then
    update public.booking_requests
    set
      status = 'declined',
      responded_at = now()
    where id = p_booking_request_id
      and status = 'pending';


    if not found then
      raise exception 'Booking request could not be declined.';
    end if;


    return;
  end if;


  -- ==========================================================
  -- Acceptance capacity check
  -- ==========================================================
  --
  -- Only accepted bookings consume capacity.
  --
  -- Because the journey row is locked, another transaction trying
  -- to accept a request for the same journey must wait and then
  -- recalculate capacity after this transaction completes.

  select
    coalesce(
      sum(br.seats_requested),
      0
    )::integer
  into accepted_seats
  from public.booking_requests br
  where br.journey_id = target_journey_id
    and br.status = 'accepted';


  remaining_seats :=
    target_seats_offered - accepted_seats;


  if remaining_seats < 0 then
    raise exception 'Journey capacity is inconsistent.';
  end if;


  if target_seats_requested > remaining_seats then
    raise exception 'Not enough seats remain to accept this request.';
  end if;


  -- ==========================================================
  -- Accept
  -- ==========================================================

  update public.booking_requests
  set
    status = 'accepted',
    responded_at = now()
  where id = p_booking_request_id
    and status = 'pending';


  if not found then
    raise exception 'Booking request could not be accepted.';
  end if;
end;
$$;


comment on function public.respond_to_booking_request(
  uuid,
  text
) is
  'Allows the authenticated journey owner to accept or decline a pending booking request. Acceptance serializes on the journey row and rechecks accepted-seat capacity to prevent overbooking.';


revoke all
on function public.respond_to_booking_request(
  uuid,
  text
)
from public, anon, authenticated;


grant execute
on function public.respond_to_booking_request(
  uuid,
  text
)
to authenticated;


commit;
