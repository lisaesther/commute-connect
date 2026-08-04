begin;

-- Ensure no existing vehicle contains a future year before
-- installing the database trigger.

do $$
begin
  if exists (
    select 1
    from public.vehicles
    where year is not null
      and year > extract(year from current_date)::integer
  ) then
    raise exception
      'Existing vehicle records contain future years. Correct them before applying this migration.';
  end if;
end;
$$;


-- Prevent future vehicle years at database level.

create or replace function public.validate_vehicle_year()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.year is not null
     and new.year > extract(year from current_date)::integer
  then
    raise exception using
      errcode = '23514',
      message = 'Vehicle year cannot be in the future.';
  end if;

  return new;
end;
$$;

drop trigger if exists vehicles_validate_year
  on public.vehicles;

create trigger vehicles_validate_year
before insert or update of year
on public.vehicles
for each row
execute function public.validate_vehicle_year();

revoke execute
  on function public.validate_vehicle_year()
  from public, anon, authenticated;

commit;
