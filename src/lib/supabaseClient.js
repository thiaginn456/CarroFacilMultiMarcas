/* =========================================================
   CLIENTE SUPABASE — conexão com o banco de dados real
   =========================================================
   As duas variáveis abaixo vêm do arquivo .env (na raiz do
   projeto). São credenciais PÚBLICAS (chave "publishable"),
   seguras para ficar no código do navegador — não são segredo.

   NUNCA coloque a chave "secret" do Supabase aqui nem em
   nenhum outro arquivo do front-end. Ela dá acesso total ao
   banco sem restrição nenhuma e deve ficar só no painel do
   Supabase (nunca em código que roda no navegador).
   ========================================================= */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase não configurado: verifique se o arquivo .env existe na raiz do projeto ' +
    'com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY preenchidos.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
