# Carro Fácil Multimarcas — versão React

Site completo em **React + Vite**, com roteamento (React Router), animações em **GSAP** (ScrollTrigger) e o mesmo comportamento da versão anterior (HTML puro): hero com vídeo do carro controlado pelo scroll, estoque com filtros, página de veículo com botão de negociar pelo WhatsApp, e área do proprietário para adicionar/excluir carros.

## Como rodar no seu computador

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

1. Extraia esta pasta em qualquer lugar do seu computador.
2. Abra um terminal dentro da pasta `carro-facil-react`.
3. Instale as dependências:
   ```
   npm install
   ```
4. Rode o site em modo de desenvolvimento:
   ```
   npm run dev
   ```
5. Abra o endereço que aparecer no terminal (algo como `http://localhost:5173`).

## Como gerar a versão final para publicar

```
npm run build
```

Isso cria uma pasta `dist/` com o site já pronto (HTML, CSS, JS otimizados) — é essa pasta `dist` que você sobe no seu serviço de hospedagem (Netlify, Vercel, Hostinger, cPanel etc.). Você pode conferir como ela ficou localmente com:

```
npm run preview
```

**Atenção ao publicar:** como o site usa rotas como `/estoque`, `/carro/:id` e `/admin`, ao publicar num servidor tradicional (Apache/cPanel) você precisa configurar redirecionamento de qualquer rota para `index.html` (isso já vem pronto por padrão na Netlify e na Vercel). Se a sua hospedagem for diferente e as páginas internas derem "404" ao atualizar a página, me avise que ajudo a configurar isso.

## Estrutura do projeto

```
src/
  assets/          → logo da loja e o vídeo do carro
  components/      → Header, Footer, CarCard, ConfirmModal, Toast
  lib/
    db.js          → "banco de dados" do estoque (localStorage)
    whatsapp.js    → mensagens e link do WhatsApp
    useScrollReveal.js → animações GSAP reutilizáveis
  pages/
    Home.jsx       → página inicial (hero + destaques + contato)
    Estoque.jsx    → lista de carros com filtros
    CarDetail.jsx  → página de um veículo (rota /carro/:id)
    Admin.jsx      → área do proprietário (rota /admin)
  App.jsx          → rotas do site
```

## Banco de dados e acesso ao painel
O estoque fica salvo no Supabase e é compartilhado entre todos os visitantes. O painel `/admin` usa Supabase Auth: crie o usuário do proprietário em **Authentication > Users** no painel do Supabase e entre com o email e a senha dessa conta.

Depois de criar o projeto, execute todo o arquivo `supabase/setup.sql` no **SQL Editor** do Supabase. Ele cria as tabelas, o bucket de fotos e as políticas que permitem leitura pública, mas restringem alterações a usuários autenticados.

O arquivo `.env` deve conter `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Nunca coloque uma chave `secret` no frontend.

## WhatsApp
Número configurado em `src/lib/whatsapp.js`: **43 98423-6342**. Todos os formulários (contato, financiamento) e o botão "Negociar" abrem o WhatsApp com a mensagem já preenchida.
