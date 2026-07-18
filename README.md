# Kavelar Feminine Beaty

Aplicação financeira responsiva e instalável (PWA) para salões de beleza. Inclui autenticação real, rotas protegidas, dashboard, receitas, despesas, caixa, profissionais, clientes, banco multiempresa e RLS.

## Configuração

1. Crie um projeto no Supabase.
2. Execute `supabase/migrations/202607150001_initial_schema.sql` no SQL Editor.
3. Crie `admin@karina.com` em Authentication > Users.
4. Execute `supabase/seed.sql` (ou altere nele o e-mail do administrador).
5. Copie `.env.example` para `.env` e preencha URL e chave `anon`.
6. Execute `npm install` e `npm run dev`.

O build de produção é criado com `npm run build` e testado com `npm run preview`.

## Segurança

O banco usa `company_id`, RLS, bloqueio de exclusão física financeira, restrição de comissões por profissional e trigger que impede movimentações em caixa fechado. Valores usam `numeric(12,2)`.

## Estrutura

`src` contém componentes, contextos, integração Supabase, layouts, páginas, schemas, serviços e tipos. `supabase` contém a migration completa e o seed persistido no banco. O manifesto e service worker da PWA são gerados no build; produção exige HTTPS.

## Evolução

A arquitetura e o banco contemplam pagamentos divididos, parcelas, comissões, serviços, produtos, fornecedores e auditoria. As próximas telas recomendadas são os fechamentos de comissão, estoque, relatórios/exportações e gestão de usuários.


