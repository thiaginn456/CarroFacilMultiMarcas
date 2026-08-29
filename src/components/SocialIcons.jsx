/**
 * =========================================================
 * Ícones de redes sociais (SVG, desenhados na mão — não são
 * os logos oficiais baixados de lugar nenhum, são só formas
 * genéricas no estilo "outline" que qualquer site usa pra
 * representar essas redes).
 * =========================================================
 * Cada ícone herda a cor do texto (fill/stroke="currentColor"),
 * então ele muda de cor sozinho no hover, seguindo o CSS
 * `.social-row a:hover{ color:var(--accent) }` do index.css.
 */

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M13.6 21V13.2H16L16.4 10.3H13.6V8.5C13.6 7.66 13.83 7.09 15.03 7.09H16.5V4.5C15.9 4.44 15.27 4.4 14.5 4.4C12.5 4.4 11.15 5.61 11.15 8.24V10.3H8.9V13.2H11.15V21"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 1.5.4 2.9 1.1 4.2L3.5 20.5l4.4-1.1c1.2.65 2.6 1 4.1 1 4.7 0 8.5-3.8 8.5-8.5S16.7 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.3c.2-.5.4-.5.6-.5h.5c.15 0 .35 0 .5.4.2.5.7 1.7.75 1.85.05.15.1.3 0 .5-.1.2-.15.3-.3.45-.15.15-.3.35-.45.45-.15.15-.3.3-.15.6.15.3.7 1.2 1.5 1.9.9.85 1.7 1.15 2 1.3.3.15.5.15.7-.05.2-.2.8-.9.95-1.2.15-.3.35-.25.55-.15.2.1 1.4.65 1.65.8.25.15.4.2.45.35.05.15.05.85-.2 1.65-.25.8-1.5 1.5-2.1 1.55-.55.05-1.2.1-3.85-1.55-2.65-1.65-3.35-3.6-3.5-3.95-.15-.35-1.2-1.75-1.2-3.35 0-1.6.85-2.4 1.15-2.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
