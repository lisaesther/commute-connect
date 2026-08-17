-- CommuteConnect journey cancellation workflow.
--
-- Published journeys are cancelled rather than deleted so that
-- journey history remains available for future booking, reporting
-- and audit functionality.

begin;

create or replace function public.cancel_journey(
  p_journey_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  target_driver_id uuid;
  target_status text;
  target_departure_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select
    j.driver_id,
    j.status,
    j.departure_at
  into
    target_driver_id,
    target_status,
    target_departure_at
  from public.journeys j
  where j.id = p_journey_id;

  if not found then
    raise exception 'Journey not found.';
  end if;

  if target_driver_id <> current_user_id then
    raise exception 'You cannot cancel another driver''s journey.';
  end if;

  if target_status = 'cancelled' then
    raise exception 'This journey has already been cancelled.';
  end if;

  if target_status = 'completed' then
    raise exception 'A completed journey cannot be cancelled.';
  end if;

  if target_departure_at <= now() then
    raise exception 'A journey cannot be cancelled after its departure time.';
  end if;

  update public.journeys
  set
    status = 'cancelled',
    cancelled_at = now()
  where id = p_journey_id
    and driver_id = current_user_id
    and status = 'open';

  if not found then
    raise exception 'Journey could not be cancelled.';
  end if;
end;
$$;

revoke all
on function public.cancel_journey(uuid)
from public, anon, authenticated;

grant execute
on function public.cancel_journey(uuid)
to authenticated;

commit;
