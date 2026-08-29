-- =========================================================
-- CARRO FÁCIL — script de criação do banco de dados
-- Cole este arquivo inteiro no SQL Editor do Supabase e
-- clique em "Run". Pode rodar mais de uma vez sem problema
-- (usa "if not exists" / "or replace" onde possível).
-- =========================================================

-- Extensão usada para gerar IDs únicos (uuid) automaticamente
create extension if not exists pgcrypto;

-- ---------- TABELA DE CARROS ----------
create table if not exists carros (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  nome text not null,
  informacao text,
  ano text,
  km_rodado text,
  combustivel text,
  cor text,
  categoria text,
  placa_final text,
  valor numeric not null default 0,
  fotos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- TABELA DE VENDEDORES ----------
create table if not exists vendedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  created_at timestamptz not null default now()
);

-- ---------- SEGURANÇA (RLS) ----------
-- Ativa a segurança em nível de linha nas duas tabelas.
alter table carros enable row level security;
alter table vendedores enable row level security;

-- Qualquer visitante do site pode LER o estoque e a lista de
-- vendedores (necessário para a Home, Estoque e sorteio de leads).
drop policy if exists "Leitura publica carros" on carros;
create policy "Leitura publica carros" on carros for select using (true);

drop policy if exists "Leitura publica vendedores" on vendedores;
create policy "Leitura publica vendedores" on vendedores for select using (true);

-- ATENÇÃO — leia isto:
-- As políticas abaixo liberam INSERT/UPDATE/DELETE para quem
-- tiver a chave pública do site (a mesma chave que já fica
-- embutida no código do navegador). Isso é necessário porque o
-- painel /admin faz login com senha só na tela, sem um sistema
-- de autenticação de verdade no banco — é o mesmo nível de
-- proteção que o site já tinha antes (senha só na interface).
-- Na prática: alguém muito técnico que descobrisse a chave
-- pública no código poderia alterar o estoque direto pela API,
-- pulando a tela de senha. Se quiser fechar essa brecha de vez,
-- me peça para configurar um login de verdade (Supabase Auth) —
-- é uma melhoria futura, não obrigatória para o site funcionar.
drop policy if exists "Escrita carros" on carros;
create policy "Escrita carros" on carros for all to authenticated using (true) with check (true);

drop policy if exists "Escrita vendedores" on vendedores;
create policy "Escrita vendedores" on vendedores for all to authenticated using (true) with check (true);

-- ---------- ARMAZENAMENTO DE FOTOS ----------
-- Cria um "bucket" público para guardar as fotos dos carros
-- (em vez de guardar as fotos como texto gigante dentro da tabela).
insert into storage.buckets (id, name, public)
values ('fotos-carros', 'fotos-carros', true)
on conflict (id) do nothing;

drop policy if exists "Leitura publica fotos" on storage.objects;
create policy "Leitura publica fotos" on storage.objects
  for select using (bucket_id = 'fotos-carros');

drop policy if exists "Upload publico fotos" on storage.objects;
drop policy if exists "Upload autenticado fotos" on storage.objects;
create policy "Upload autenticado fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos-carros');

drop policy if exists "Exclusao publica fotos" on storage.objects;
drop policy if exists "Exclusao autenticada fotos" on storage.objects;
create policy "Exclusao autenticada fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos-carros');
