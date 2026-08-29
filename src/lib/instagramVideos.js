/**
 * =========================================================
 * Vídeos do Instagram exibidos no carrossel da Home
 * =========================================================
 * Cada item vira um card no carrossel (ver InstagramCarousel.jsx).
 * O "title" é só um texto interno (não aparece pro visitante).
 *
 * Como adicionar um novo vídeo (você mesmo, sem precisar de mim):
 * 1. Abra o post/reel no site do Instagram (não no app do celular).
 * 2. Copie a URL da barra de endereço — algo como:
 *    https://www.instagram.com/<usuario>/reel/XXXXXXXXXXX/
 *    ou https://www.instagram.com/p/XXXXXXXXXXX/
 * 3. Cole como um novo objeto { url, title } na lista abaixo.
 *
 * Obs: eu (IA) não consigo entrar no Instagram de vocês pra
 * "catar" vídeos sozinho — não tenho login nem acesso ao app.
 * Se quiser mais vídeos no carrossel, é só mandar os links.
 */

const baseUrl = import.meta.env.BASE_URL || '/';

export const instagramVideos = [
  {
    url: 'https://www.instagram.com/p/DJNBnG3xe8K/',
    title: 'Vídeo Carro Fácil 1',
    thumbnail: `${baseUrl}instagram-1.jpg`
  },
  {
    url: 'https://www.instagram.com/p/DN_NBdGDp96/',
    title: 'Vídeo Carro Fácil 2',
    thumbnail: `${baseUrl}instagram-2.jpg`
  },
  {
    url: 'https://www.instagram.com/p/DCCFwHdRiog/',
    title: 'Vídeo Carro Fácil 3',
    thumbnail: `${baseUrl}instagram-3.jpg`
  },
  {
    url: 'https://www.instagram.com/helton_carrofacil/reel/DOmyfOejAyM/',
    title: 'Vídeo Carro Fácil 4',
    thumbnail: `${baseUrl}instagram-4.jpg`
  },
  {
    url: 'https://www.instagram.com/helton_carrofacil/reel/DcetFjqIMJw/',
    title: 'Vídeo Carro Fácil 5',
    thumbnail: `${baseUrl}instagram-5.jpg`
  }
];
