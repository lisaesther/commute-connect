-- Harden the inclusive 5 km journey-search boundary.
--
-- Boundary Value Analysis identified numerical edge behaviour where a
-- geography point measured as exactly 5000 metres by ST_Distance could
-- evaluate as outside ST_DWithin(..., 5000).
--
-- The product policy remains a 5000 metre search radius. A 1 millimetre
-- computational epsilon is applied only to the spatial predicate so that
-- the intended inclusive boundary is robust to negligible numerical
-- differences in PostGIS geography calculations.

begin;

create or replace function public.search_journeys(
  p_origin_lat double precision,
  p_origin_lng double precision,
  p_destination_lat double precision,
  p_destination_lng double precision,
  p_preferred_departure timestamptz,
  p_seats_needed smallint
)
returns table (
  journey_id uuid,
  driver_name text,
  origin_name text,
  destination_name text,
  departure_at timestamptz,
  departure_flexibility_minutes smallint,
  seats_offered smallint,
  available_seats smallint,
  suggested_contribution numeric,
  luggage_preference text,
  pets_preference text,
  smoking_allowed boolean,
  origin_distance_meters double precision,
  destination_distance_meters double precision,
  time_difference_minutes integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;

  search_origin gis.geography(Point, 4326);
  search_destination gis.geography(Point, 4326);

  search_radius_meters constant double precision := 5000;
  spatial_boundary_epsilon_meters constant double precision := 0.001;
  search_time_window constant interval := interval '60 minutes';
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;


  -- Validate coordinates before constructing PostGIS points.

  if p_origin_lat is null
     or not (p_origin_lat between -90 and 90) then
    raise exception 'Origin latitude is invalid.';
  end if;

  if p_origin_lng is null
     or not (p_origin_lng between -180 and 180) then
    raise exception 'Origin longitude is invalid.';
  end if;

  if p_destination_lat is null
     or not (p_destination_lat between -90 and 90) then
    raise exception 'Destination latitude is invalid.';
  end if;

  if p_destination_lng is null
     or not (p_destination_lng between -180 and 180) then
    raise exception 'Destination longitude is invalid.';
  end if;


  if p_preferred_departure is null then
    raise exception 'Preferred departure time is required.';
  end if;

  if p_preferred_departure <= now() then
    raise exception 'Preferred departure time must be in the future.';
  end if;


  if p_seats_needed is null
     or p_seats_needed < 1
     or p_seats_needed > 8 then
    raise exception 'Seats needed must be between 1 and 8.';
  end if;


  if p_origin_lat = p_destination_lat
     and p_origin_lng = p_destination_lng then
    raise exception 'Origin and destination must be different.';
  end if;


  search_origin :=
    gis.st_setsrid(
      gis.st_makepoint(
        p_origin_lng,
        p_origin_lat
      ),
      4326
    )::gis.geography;


  search_destination :=
    gis.st_setsrid(
      gis.st_makepoint(
        p_destination_lng,
        p_destination_lat
      ),
      4326
    )::gis.geography;


  return query
  with matching_journeys as (
    select
      j.id as journey_id,
      p.full_name as driver_name,

      j.origin_name,
      j.destination_name,

      j.departure_at,
      j.departure_flexibility_minutes,

      j.seats_offered,
      capacity.accepted_seats,
      j.suggested_contribution,

      j.luggage_preference,
      j.pets_preference,
      j.smoking_allowed,

      gis.st_distance(
        j.origin_location,
        search_origin
      ) as origin_distance_meters,

      gis.st_distance(
        j.destination_location,
        search_destination
      ) as destination_distance_meters,

      abs(
        extract(
          epoch from (
            j.departure_at -
            p_preferred_departure
          )
        )
      ) / 60.0 as time_difference_minutes
    from public.journeys j

    inner join public.profiles p
      on p.id = j.driver_id

    left join lateral (
      select
        coalesce(
          sum(br.seats_requested),
          0
        )::integer as accepted_seats
      from public.booking_requests br
      where br.journey_id = j.id
        and br.status = 'accepted'
    ) capacity
      on true

    where
      j.status = 'open'

      and j.departure_at > now()

      and j.driver_id <> current_user_id

      and (
        j.seats_offered -
        capacity.accepted_seats
      ) >= p_seats_needed

      and not exists (
        select 1
        from public.booking_requests existing_request
        where existing_request.journey_id = j.id
          and existing_request.passenger_id = current_user_id
          and existing_request.status in (
            'pending',
            'accepted'
          )
      )

      and j.departure_at between
        p_preferred_departure - search_time_window
        and
        p_preferred_departure + search_time_window

      and gis.st_dwithin(
        j.origin_location,
        search_origin,
        search_radius_meters + spatial_boundary_epsilon_meters
      )

      and gis.st_dwithin(
        j.destination_location,
        search_destination,
        search_radius_meters + spatial_boundary_epsilon_meters
      )
  )

  select
    m.journey_id,
    m.driver_name,

    m.origin_name,
    m.destination_name,

    m.departure_at,
    m.departure_flexibility_minutes,

    m.seats_offered,

    greatest(
      m.seats_offered -
      m.accepted_seats,
      0
    )::smallint as available_seats,

    m.suggested_contribution,

    m.luggage_preference,
    m.pets_preference,
    m.smoking_allowed,

    m.origin_distance_meters,
    m.destination_distance_meters,

    round(
      m.time_difference_minutes
    )::integer
  from matching_journeys m

  order by
    (
      m.origin_distance_meters +
      m.destination_distance_meters
    ) asc,

    m.time_difference_minutes asc,

    m.departure_at asc

  limit 50;
end;
$$;

comment on function public.search_journeys(
  double precision,
  double precision,
  double precision,
  double precision,
  timestamptz,
  smallint
) is
  'Returns authenticated passenger-safe journey matches using a 5 km endpoint proximity and a +/- 60 minute departure window. A 1 mm computational epsilon is applied only to the spatial predicate to preserve the intended inclusive 5 km boundary. Remaining capacity is derived from accepted bookings and journeys with an existing active request by the caller are excluded. Exact stored coordinates and private journey details are not returned.';

commit;
