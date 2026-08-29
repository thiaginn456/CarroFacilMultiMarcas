import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollSmoother, ScrollTrigger } from '../lib/useScrollReveal.js';

/**
 * Envolve o app inteiro com o GSAP ScrollSmoother: o scroll nativo
 * continua funcionando normalmente (scrollbar real, roda do mouse,
 * touch), mas o conteúdo acompanha esse scroll com um pequeno
 * amortecimento, então a rolagem fica fluida em vez de "pulando"
 * a cada evento de wheel/touch — o que também deixa o vídeo do
 * hero (controlado pelo progresso do scroll) suave, sem saltos.
 */
export default function SmoothScroll({ children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const smootherRef = useRef(null);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.1,
      smoothTouch: 0.1, // suavização bem leve no touch, mantém a naturalidade do celular
      normalizeScroll: true,
      effects: false
    });

    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  // Ao trocar de rota, volta pro topo (suave) e recalcula os triggers
  // já que a altura da página muda de uma rota para outra.
  useEffect(() => {
    if (hash) return;
    if (smootherRef.current) {
      smootherRef.current.scrollTo(0, false);
    } else {
      window.scrollTo(0, 0);
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
