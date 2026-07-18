do $$declare uid uuid;income_id uuid;expense_id uuid;begin
select id into uid from auth.users where email='admin@karina.com' limit 1;if uid is null then raise exception 'Crie admin@karina.com no Authentication primeiro';end if;
insert into profiles(id,full_name,email,role) values(uid,'Karina Administradora','admin@karina.com','admin');
insert into financial_categories(name,type) values('Serviços','income') returning id into income_id;insert into financial_categories(name,type) values('Custos fixos','expense') returning id into expense_id;
insert into payment_methods(name,maximum_installments) values('Dinheiro',1),('PIX',1),('Cartão de débito',1),('Cartão de crédito',12);
insert into professionals(name,phone,specialty,employment_type,default_commission_type,default_commission_value) values('Ana Lima','(11) 98888-1001','Cabeleireira','partner','percentage',40),('Beatriz Alves','(11) 98888-1002','Manicure','employee','percentage',35),('Camila Rocha','(11) 98888-1003','Esteticista','partner','percentage',40);
insert into customers(name,phone) values('Mariana Souza','(11) 90000-1001'),('Juliana Costa','(11) 90000-1002'),('Patrícia Lima','(11) 90000-1003'),('Fernanda Melo','(11) 90000-1004'),('Renata Dias','(11) 90000-1005');
insert into services(category_id,name,duration_minutes,cost,price,default_commission) values(income_id,'Corte feminino',60,15,90,40),(income_id,'Escova',45,10,65,40),(income_id,'Manicure',40,8,40,35),(income_id,'Pedicure',50,10,50,35),(income_id,'Coloração',120,55,220,35),(income_id,'Hidratação',60,30,120,40),(income_id,'Design de sobrancelha',30,5,45,40),(income_id,'Depilação',40,10,70,35),(income_id,'Maquiagem',75,25,180,40),(income_id,'Penteado',90,20,160,40);
insert into cash_registers(opened_by,initial_balance,expected_balance) values(uid,200,200);
end$$;
