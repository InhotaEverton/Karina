alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
check(status in('scheduled','confirmed','in_service','completed','cancelled','no_show'));

create table if not exists public.schedule_blocks(
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default 'Indisponível',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check(ends_at>starts_at)
);
create index if not exists schedule_blocks_period on public.schedule_blocks(starts_at,ends_at);
alter table public.schedule_blocks enable row level security;
create policy blocks_select on public.schedule_blocks for select to authenticated using(public.my_role() is not null);
create policy blocks_insert on public.schedule_blocks for insert to authenticated with check(public.my_role() is not null);
create policy blocks_update on public.schedule_blocks for update to authenticated using(public.my_role() is not null);
create policy blocks_delete on public.schedule_blocks for delete to authenticated using(public.my_role() in('admin','manager'));

create or replace function public.available_booking_slots(p_date date) returns table(slot text) language plpgsql security definer set search_path=public as $$
declare cfg booking_settings%rowtype;t time;default_duration int;slot_start timestamptz;slot_end timestamptz;
begin
  select * into cfg from booking_settings where id=true;
  if not cfg.active or not(extract(isodow from p_date)::int=any(cfg.weekdays)) or p_date<current_date then return;end if;
  select coalesce(duration_minutes,30) into default_duration from services where active order by name limit 1;
  t:=cfg.start_time;
  while t+(coalesce(default_duration,30)||' minutes')::interval<=cfg.end_time loop
    slot_start:=(p_date+t)::timestamp at time zone 'America/Sao_Paulo';slot_end:=slot_start+(coalesce(default_duration,30)||' minutes')::interval;
    if not exists(select 1 from appointments a where a.status<>'cancelled' and tstzrange(a.starts_at,a.ends_at,'[)')&&tstzrange(slot_start,slot_end,'[)'))
      and not exists(select 1 from schedule_blocks b where tstzrange(b.starts_at,b.ends_at,'[)')&&tstzrange(slot_start,slot_end,'[)'))
    then slot:=to_char(t,'HH24:MI');return next;end if;
    t:=t+(cfg.slot_minutes||' minutes')::interval;
  end loop;
end$$;

do $$begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='schedule_blocks') then alter publication supabase_realtime add table public.schedule_blocks;end if;end$$;
