create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  professional_id uuid not null references public.professionals(id),
  service_id uuid not null references public.services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check(status in('scheduled','confirmed','completed','cancelled','no_show')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(ends_at>starts_at)
);
create index if not exists appointments_professional_date on public.appointments(professional_id,starts_at,ends_at);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now();return new;end $$;
drop trigger if exists appointments_updated on public.appointments;
create trigger appointments_updated before update on public.appointments for each row execute function public.set_updated_at();

create or replace function public.prevent_appointment_overlap() returns trigger language plpgsql as $$
begin
  if new.status<>'cancelled' and exists(
    select 1 from public.appointments a where a.professional_id=new.professional_id
    and a.id<>new.id and a.status<>'cancelled'
    and tstzrange(a.starts_at,a.ends_at,'[)')&&tstzrange(new.starts_at,new.ends_at,'[)')
  ) then raise exception 'Este horário não está mais disponível para o profissional';end if;
  return new;
end $$;
drop trigger if exists appointments_no_overlap on public.appointments;
create trigger appointments_no_overlap before insert or update on public.appointments for each row execute function public.prevent_appointment_overlap();

alter table public.appointments enable row level security;
drop policy if exists appointments_select on public.appointments;
drop policy if exists appointments_insert on public.appointments;
drop policy if exists appointments_update on public.appointments;
create policy appointments_select on public.appointments for select to authenticated using(public.my_role() is not null);
create policy appointments_insert on public.appointments for insert to authenticated with check(public.my_role() is not null);
create policy appointments_update on public.appointments for update to authenticated using(public.my_role() is not null) with check(public.my_role() is not null);
