create table if not exists public.booking_settings(id boolean primary key default true check(id),active boolean not null default true,weekdays int[] not null default array[2,3,4,5,6],start_time time not null default '10:30',end_time time not null default '19:00',slot_minutes int not null default 30 check(slot_minutes between 10 and 180),updated_at timestamptz not null default now());
insert into public.booking_settings(id) values(true) on conflict(id) do nothing;
alter table public.booking_settings enable row level security;
create policy booking_settings_public_read on public.booking_settings for select to anon,authenticated using(true);
create policy booking_settings_admin_update on public.booking_settings for update to authenticated using(public.my_role()='admin');

create or replace function public.available_booking_slots(p_date date) returns table(slot text) language plpgsql security definer set search_path=public as $$
declare cfg booking_settings%rowtype; t time; default_duration int;
begin
  select * into cfg from booking_settings where id=true;
  if not cfg.active or not(extract(isodow from p_date)::int=any(cfg.weekdays)) or p_date<current_date then return;end if;
  select coalesce(duration_minutes,30) into default_duration from services where active limit 1;
  t:=cfg.start_time;
  while t+(coalesce(default_duration,30)||' minutes')::interval<=cfg.end_time loop
    if not exists(select 1 from appointments a where a.status<>'cancelled' and tstzrange(a.starts_at,a.ends_at,'[)')&&tstzrange((p_date+t)::timestamp at time zone 'America/Sao_Paulo',((p_date+t)::timestamp+(coalesce(default_duration,30)||' minutes')::interval) at time zone 'America/Sao_Paulo','[)')) then slot:=to_char(t,'HH24:MI');return next;end if;
    t:=t+(cfg.slot_minutes||' minutes')::interval;
  end loop;
end$$;

create or replace function public.create_public_booking(p_name text,p_phone text,p_date date,p_time time) returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;pid uuid;sid uuid;aid uuid;duration int;start_at timestamptz;clean_phone text;
begin
  if length(trim(p_name))<3 then raise exception 'Informe o nome completo';end if;
  clean_phone:=regexp_replace(p_phone,'\D','','g');if length(clean_phone)<10 then raise exception 'Informe um telefone vÃ¡lido';end if;
  if not exists(select 1 from available_booking_slots(p_date) where slot=to_char(p_time,'HH24:MI')) then raise exception 'Este horÃ¡rio nÃ£o estÃ¡ disponÃ­vel';end if;
  select id into cid from customers where regexp_replace(coalesce(phone,''),'\D','','g')=clean_phone limit 1;
  if cid is null then insert into customers(name,phone,active) values(trim(p_name),p_phone,true) returning id into cid;else update customers set name=trim(p_name),active=true where id=cid;end if;
  select id into pid from professionals where active limit 1;select id,duration_minutes into sid,duration from services where active order by name limit 1;
  if pid is null or sid is null then raise exception 'Agenda ainda nÃ£o configurada pelo salÃ£o';end if;
  start_at:=(p_date+p_time)::timestamp at time zone 'America/Sao_Paulo';
  insert into appointments(customer_id,professional_id,service_id,starts_at,ends_at,status,notes,created_by) values(cid,pid,sid,start_at,start_at+(duration||' minutes')::interval,'scheduled','Agendamento realizado pelo cliente',(select id from profiles where role='admin' and active limit 1)) returning id into aid;
  return aid;
end$$;
grant execute on function public.available_booking_slots(date) to anon,authenticated;
grant execute on function public.create_public_booking(text,text,date,time) to anon,authenticated;
do $$begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='appointments') then alter publication supabase_realtime add table public.appointments;end if;end$$;

