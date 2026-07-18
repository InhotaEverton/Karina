alter table public.appointments add column if not exists public_token uuid not null default gen_random_uuid();
create unique index if not exists appointments_public_token on public.appointments(public_token);

create or replace function public.get_booking_access(p_id uuid,p_phone text) returns uuid language sql security definer set search_path=public as $$
  select a.public_token from appointments a join customers c on c.id=a.customer_id
  where a.id=p_id and regexp_replace(coalesce(c.phone,''),'\D','','g')=regexp_replace(coalesce(p_phone,''),'\D','','g') limit 1
$$;

create or replace function public.get_public_booking(p_token uuid) returns table(customer_name text,starts_at timestamptz,ends_at timestamptz,status text) language sql security definer set search_path=public as $$
  select c.name,a.starts_at,a.ends_at,a.status from appointments a join customers c on c.id=a.customer_id where a.public_token=p_token limit 1
$$;

create or replace function public.update_public_booking(p_token uuid,p_action text) returns text language plpgsql security definer set search_path=public as $$
declare ap appointments%rowtype;
begin
  select * into ap from appointments where public_token=p_token for update;
  if ap.id is null then raise exception 'Agendamento não encontrado';end if;
  if ap.status in('completed','cancelled','no_show') then raise exception 'Este agendamento não pode mais ser alterado';end if;
  if p_action='cancel' then
    if ap.starts_at<=now()+interval '12 hours' then raise exception 'O cancelamento online encerra 12 horas antes do atendimento';end if;
    update appointments set status='cancelled' where id=ap.id;return 'cancelled';
  elsif p_action='confirm' then update appointments set status='confirmed' where id=ap.id;return 'confirmed';
  else raise exception 'Ação inválida';end if;
end$$;
grant execute on function public.get_booking_access(uuid,text) to anon,authenticated;
grant execute on function public.get_public_booking(uuid) to anon,authenticated;
grant execute on function public.update_public_booking(uuid,text) to anon,authenticated;
