create extension if not exists btree_gist;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_prevent_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_prevent_overlap
      exclude using gist (
        professional_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      ) where (status <> 'cancelled');
  end if;
end $$;
