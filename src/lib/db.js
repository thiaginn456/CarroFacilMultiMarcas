/* =========================================================
   CARRO FÁCIL — banco de dados (Supabase)
   =========================================================
   Antes, o estoque ficava salvo no localStorage (só no
   navegador de cada pessoa). Agora os dados ficam num banco
   Postgres real na nuvem (Supabase), então o estoque é o
   mesmo pra todo mundo, em qualquer dispositivo, e o que o
   dono cadastra no Admin aparece pra todos os visitantes.

   As tabelas (carros, vendedores) e o bucket de fotos são
   criados pelo script supabase/setup.sql — veja o README.

  O login do Admin usa Supabase Auth; apenas usuários autenticados
  conseguem gravar ou excluir dados.
   ========================================================= */
import { supabase } from './supabaseClient.js';

const FOTOS_BUCKET = 'fotos-carros';

// Gera uma imagem SVG simples (silhueta de carro + nome) usada
// como "foto" quando o veículo ainda não tem nenhuma foto real
// cadastrada. Assim o card nunca fica com espaço vazio/quebrado.
export function placeholderSvg(label) {
  const safe = (label || 'CARRO FÁCIL').toUpperCase();
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#e9efe9"/>
      <g transform="translate(400,300)" fill="none" stroke="#0c130f" stroke-width="10" opacity="0.55">
        <path d="M-260,20 L-220,-40 Q-190,-70 -140,-70 L120,-70 Q170,-70 200,-30 L240,20 L260,20 L260,70 L220,70 M-260,70 L-220,70" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="-160" cy="70" r="34"/>
        <circle cx="150" cy="70" r="34"/>
      </g>
      <text x="400" y="330" font-family="Rajdhani, sans-serif" font-weight="700" font-size="30" fill="#0c130f" text-anchor="middle" letter-spacing="2">${safe}</text>
    </svg>`);
}

/* ---------------- mapeamento de colunas ----------------
   O banco usa snake_case (km_rodado, placa_final...), mas o
   resto do site (Home, Estoque, CarDetail, Admin) foi escrito
   usando camelCase (kmRodado, placaFinal...). Essas duas
   funções convertem de um formato pro outro, então nenhum
   outro arquivo do site precisou mudar os nomes dos campos.
   ------------------------------------------------------- */
function rowToCar(row) {
  return {
    id: row.id,
    marca: row.marca,
    modelo: row.modelo,
    nome: row.nome,
    informacao: row.informacao,
    ano: row.ano,
    kmRodado: row.km_rodado,
    combustivel: row.combustivel,
    cor: row.cor,
    categoria: row.categoria,
    placaFinal: row.placa_final,
    valor: row.valor,
    fotos: row.fotos || [],
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

function carToRow(car) {
  return {
    marca: car.marca,
    modelo: car.modelo,
    nome: car.nome,
    informacao: car.informacao,
    ano: car.ano,
    km_rodado: car.kmRodado,
    combustivel: car.combustivel,
    cor: car.cor,
    categoria: car.categoria,
    placa_final: car.placaFinal,
    valor: car.valor,
    fotos: car.fotos || []
  };
}

// Lê todo o estoque salvo no banco de dados, mais recentes primeiro.
export async function readAll() {
  const { data, error } = await supabase
    .from('carros')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao ler estoque', error);
    return [];
  }
  return (data || []).map(rowToCar);
}

// Busca um carro específico pelo id (usado na página de detalhe).
// Retorna `null` se não encontrar (carro vendido/removido).
export async function getById(id) {
  const { data, error } = await supabase
    .from('carros')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCar(data);
}

// Envia as fotos (arquivos escolhidos no Admin) para o Storage do
// Supabase e devolve a lista de URLs públicas, na mesma ordem.
// `files` deve ser um array de File (do input de arquivo).
export async function uploadFotos(files) {
  const urls = [];
  for (const file of files) {
    const ext = (file.name || '').split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(FOTOS_BUCKET).upload(path, file);
    if (error) {
      console.error('Erro ao enviar foto', error);
      continue;
    }
    const { data } = supabase.storage.from(FOTOS_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// Adiciona um carro novo ao estoque (chamado pelo formulário do
// Admin). `car.fotos`, se vier preenchido, já deve conter URLs
// (use uploadFotos() antes de chamar esta função).
export async function addCar(car) {
  const { data, error } = await supabase
    .from('carros')
    .insert(carToRow(car))
    .select()
    .single();
  if (error) {
    console.error('Erro ao adicionar carro', error);
    throw error;
  }
  return rowToCar(data);
}

// Remove um carro do estoque pelo id (botão "Excluir" no Admin).
export async function deleteCar(id) {
  const { error } = await supabase.from('carros').delete().eq('id', id);
  if (error) console.error('Erro ao excluir carro', error);
}

// Filtra o estoque pelos critérios da página de Estoque.
// Recebe a lista já carregada (com readAll) — filtro é feito
// em memória, sem nova ida ao banco. Qualquer filtro
// vazio/undefined é ignorado (não restringe nada).
export function filterCars(cars, { marca, modelo, ano, precoMax } = {}) {
  return (cars || []).filter((c) => {
    if (marca && c.marca !== marca) return false;
    if (modelo && c.modelo !== modelo) return false;
    if (ano && String(c.ano) !== String(ano)) return false;
    if (precoMax && Number(c.valor) > Number(precoMax)) return false;
    return true;
  });
}

/* =========================================================
   VENDEDORES — distribuição automática de leads no WhatsApp
   ========================================================= */

// Lê a lista de vendedores salva no banco.
export async function readSellers() {
  const { data, error } = await supabase
    .from('vendedores')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Erro ao ler vendedores', error);
    return [];
  }
  return (data || []).map((s) => ({ id: s.id, nome: s.nome, whatsapp: s.whatsapp }));
}

// Adiciona um vendedor novo. `whatsapp` deve vir só com números
// (DDI + DDD + número), ex: 5543999998888 — sem espaço, traço ou +.
export async function addSeller({ nome, whatsapp }) {
  const { data, error } = await supabase
    .from('vendedores')
    .insert({ nome: (nome || '').trim(), whatsapp: onlyDigits(whatsapp) })
    .select()
    .single();
  if (error) {
    console.error('Erro ao adicionar vendedor', error);
    throw error;
  }
  return { id: data.id, nome: data.nome, whatsapp: data.whatsapp };
}

export async function deleteSeller(id) {
  const { error } = await supabase.from('vendedores').delete().eq('id', id);
  if (error) console.error('Erro ao excluir vendedor', error);
}

// Remove tudo que não for número (espaços, traços, parênteses, +).
function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

// Sorteia um vendedor aleatório entre os cadastrados.
// Retorna o número de WhatsApp dele, ou `null` se não houver
// nenhum vendedor cadastrado ainda.
export async function getRandomSellerWhatsApp() {
  const sellers = await readSellers();
  if (!sellers.length) return null;
  const escolhido = sellers[Math.floor(Math.random() * sellers.length)];
  return escolhido.whatsapp;
}

// Lista de valores únicos de um campo (ex: todas as marcas
// diferentes cadastradas), usada para popular os selects de
// filtro na página de Estoque. Recebe a lista já carregada.
export function distinctValues(cars, field) {
  return [...new Set((cars || []).map((c) => c[field]).filter(Boolean))].sort();
}

// Formata um número como preço em reais (padrão brasileiro:
// vírgula decimal, ponto de milhar). Ex: 104900 -> "104.900,00".
// Não inclui o "R$" — isso é escrito à parte onde for exibido.
export function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------------- admin auth (Supabase Auth) ----------------
   A sessão e a senha são gerenciadas pelo servidor do Supabase.
   Crie o usuário do proprietário em Authentication > Users.
   ------------------------------------------------------------ */

export async function getAdminSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInAdmin(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  return supabase.auth.signOut();
}

export async function updateAdminPassword(password) {
  return supabase.auth.updateUser({ password });
}
