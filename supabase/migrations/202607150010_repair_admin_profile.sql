-- Aplicação de salão único: vincula o primeiro usuário autenticado ao perfil administrador.
do $$
declare admin_user auth.users%rowtype;
begin
  select * into admin_user from auth.users order by created_at limit 1;
  if admin_user.id is null then
    raise exception 'Nenhum usuário foi criado em Authentication > Users';
  end if;

  insert into public.profiles(id,full_name,email,role,active)
  values(
    admin_user.id,
    coalesce(nullif(admin_user.raw_user_meta_data->>'full_name',''),'Karina'),
    admin_user.email,
    'admin',
    true
  )
  on conflict(id) do update set
    email=excluded.email,
    role='admin',
    active=true,
    updated_at=now();
end $$;
