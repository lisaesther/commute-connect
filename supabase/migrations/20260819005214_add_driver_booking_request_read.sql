-- CommuteConnect safe driver booking-request read model.
--
-- Drivers need passenger request information for journeys they own,
-- but the private profiles table must not be broadened for general
-- authenticated access.
--
-- This SECURITY DEFINER RPC returns only the minimum passenger-safe
-- fields required for the driver booking workflow.

begin;


create or replace function public.get_driver_booking_requests()
returns table (
  booking_request_id uuid,
  journey_id uuid,
  passenger_name text,
  origin_name text,
  destination_name text,
  departure_at timestamptz,
  seats_requested smallint,
  booking_status text,
  journey_status text,
  requested_at timestamptz,
  responded_at timestamptz
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
  -- Safe driver request projection
  -- ==========================================================
  --
  -- Only booking requests belonging to journeys owned by the
  -- authenticated caller are returned.
  --
  -- Private profile information such as email, phone, organisation
  -- and gender-related fields is deliberately excluded.

  return query
  select
    br.id as booking_request_id,
    br.journey_id,
    p.full_name as passenger_name,

    j.origin_name,
    j.destination_name,
    j.departure_at,

    br.seats_requested,
    br.status as booking_status,
    j.status as journey_status,

    br.created_at as requested_at,
    br.responded_at

  from public.booking_requests br

  inner join public.journeys j
    on j.id = br.journey_id

  inner join public.profiles p
    on p.id = br.passenger_id

  where j.driver_id = current_user_id

  order by
    case
      when br.status = 'pending' then 0
      else 1
    end,
    br.created_at desc;
end;
$$;


comment on function public.get_driver_booking_requests() is
  'Returns passenger-safe booking request summaries only for journeys owned by the authenticated driver. Private profile fields are not exposed.';


-- Public-schema functions may otherwise inherit EXECUTE privileges,
-- so restrict access explicitly.

revoke all
on function public.get_driver_booking_requests()
from public, anon, authenticated;


grant execute
on function public.get_driver_booking_requests()
to authenticated;


commit;
