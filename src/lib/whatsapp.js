/* =========================================================
   Integração com WhatsApp
   =========================================================
   Regra geral: todo formulário e todo botão "Negociar" abrem
   o WhatsApp com uma mensagem pré-preenchida.

   Duas situações diferentes:
  1) Contato genérico (formulário "Fale conosco" da Home) —
    vai para um vendedor cadastrado.
   2) Interesse em comprar um carro específico (botão "Negociar"
      e formulário de financiamento na página do veículo) — o
      site sorteia um vendedor da lista cadastrada em Admin e
      manda para o WhatsApp dele. Se não houver vendedor cadastrado,
      nenhuma mensagem é enviada.
   ========================================================= */
import { formatBRL, getRandomSellerWhatsApp } from './db.js';

// Igual openWhatsApp, mas sorteia um vendedor da lista cadastrada
// no Admin (aba "Vendedores"). Use esta função em qualquer botão
// que representa intenção de COMPRA (negociar, financiar, etc).
export async function openWhatsAppComVendedorAleatorio(message, vendedorSelecionado) {
  // Abre a aba em branco JÁ (de forma síncrona, direto no clique) e só
  // depois preenche o endereço — assim o navegador não bloqueia a aba
  // como pop-up (isso aconteceria se esperássemos a resposta do banco
  // de dados antes de chamar window.open).
  const win = window.open('about:blank', '_blank');
  if (win) win.opener = null;
  const numeroVendedor = await (vendedorSelecionado || getRandomSellerWhatsApp()); // null se não houver vendedor cadastrado
  if (!numeroVendedor) {
    if (win && !win.closed) win.close();
    alert('Nenhum vendedor está cadastrado no momento.');
    return;
  }
  const url = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(message)}`;
  if (win && !win.closed) {
    win.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

// Abre o WhatsApp somente quando existe vendedor cadastrado.
export async function openWhatsAppComVendedorObrigatorio(message) {
  const win = window.open('about:blank', '_blank');
  if (win) win.opener = null;

  const numeroVendedor = await getRandomSellerWhatsApp();
  if (!numeroVendedor) {
    if (win && !win.closed) win.close();
    alert('Nenhum vendedor está cadastrado no momento.');
    return;
  }

  const url = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(message)}`;
  if (win && !win.closed) win.location.href = url;
}

export function contactMessage({ nome, whatsapp, mensagem }) {
  return `Olá, sou ${nome}. Meu WhatsApp é ${whatsapp}. ${mensagem ? 'Mensagem: ' + mensagem : ''}`.trim();
}

export function interestMessage(car) {
  const nome = car.nome || `${car.marca} ${car.modelo}`;
  return `Olá! Tenho interesse no veículo ${nome} (${car.ano}), anunciado por R$ ${formatBRL(car.valor)} no site da Carro Fácil. Pode me passar mais informações?`;
}

export function financingMessage(car, data) {
  const nome = car.nome || `${car.marca} ${car.modelo}`;
  return [
    `Olá, sou ${data.nome}, quero simular o financiamento do veículo ${nome} (${car.ano}) - R$ ${formatBRL(car.valor)}.`,
    `WhatsApp: ${data.whatsapp}`,
    data.sexo ? `Sexo: ${data.sexo}` : '',
    data.estadoCivil ? `Estado civil: ${data.estadoCivil}` : '',
    data.cpf ? `CPF: ${data.cpf}` : '',
    data.rg ? `RG: ${data.rg}` : ''
  ].filter(Boolean).join('\n');
}
