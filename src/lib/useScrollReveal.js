import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Aplica reveals de scroll (fade + slide up) em qualquer elemento
 * com atributo data-reveal, e reveals com stagger em containers
 * marcados com data-reveal-group. Rode dentro de um useEffect
 * depois que a página tiver renderizado seu conteúdo.
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = document.querySelectorAll('[data-reveal]');
      items.forEach((el, i) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
            delay: el.dataset.revealDelay ? Number(el.dataset.revealDelay) : (i % 4) * 0.06,
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        );
      });

      const groups = document.querySelectorAll('[data-reveal-group]');
      groups.forEach((group) => {
        gsap.fromTo(group.children,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09,
            scrollTrigger: { trigger: group, start: 'top 85%' }
          }
        );
      });
    });

    // garante que os triggers considerem o layout já pintado
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
