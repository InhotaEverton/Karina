-- Reservas públicas são criadas sem usuário autenticado.
alter table public.appointments alter column created_by drop not null;

comment on column public.appointments.created_by is
'Usuário interno responsável; nulo quando o agendamento é criado pelo formulário público.';
