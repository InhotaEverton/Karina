-- Garante os recursos internos necessários ao agendamento público simples.
insert into public.professionals(name,specialty,employment_type,default_commission_type,default_commission_value,active)
select 'Kavelar','Atendimento','owner','percentage',0,true
where not exists(select 1 from public.professionals where active);

insert into public.services(name,description,duration_minutes,cost,price,default_commission,active)
select 'Atendimento','Horário reservado pelo agendamento público',30,0,0,0,true
where not exists(select 1 from public.services where active);
