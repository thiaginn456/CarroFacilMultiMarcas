import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../lib/useScrollReveal.js';

/**
 * Rola a página suavemente para o topo sempre que a rota muda
 * (o React Router não faz isso sozinho, então sem isto o usuário
 * "aparece" no meio da próxima página). Também recalcula os
 * ScrollTriggers, já que a altura muda de uma rota para outra.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const scrollToAnchor = () => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
      };
      const frame = requestAnimationFrame(() => requestAnimationFrame(scrollToAnchor));
      const retry = window.setTimeout(scrollToAnchor, 250);
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(retry);
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return null;
}
