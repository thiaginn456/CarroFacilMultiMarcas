/* =========================================================
   CABEÇALHO DO SITE (aparece em toda página, exceto Admin)
   =========================================================
   - `scrolled`: fica true depois que o usuário rola 40px pra
     baixo — usado no CSS pra dar um fundo sólido ao header
     (classe `.is-scrolled`), já que no topo ele é transparente.
   - `open`: controla o menu mobile (gaveta lateral).
   ========================================================= */
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { openWhatsAppComVendedorObrigatorio } from '../lib/whatsapp.js';

export default function Header({ heroFinished = true }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const contactHref = `${baseUrl}/#contato`;

  const close = () => setOpen(false);

  function handleWhatsAppContact(e) {
    e.preventDefault();
    openWhatsAppComVendedorObrigatorio('Olá! Gostaria de saber mais sobre os veículos da Carro Fácil.');
  }

  return (
    <>
      <header className={`site-header${heroFinished ? ' is-scrolled' : ''}`}>
        <div className="wrap">
          <Link to="/" className="logo">
            <img src={logo} alt="Carro Fácil Multimarcas" />
          </Link>
          <nav className="main-nav">
            <ul>
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/estoque">Estoque</NavLink></li>
              <li><a href={contactHref}>Entre em contato</a></li>
            </ul>
          </nav>
          <a href="#whatsapp" className="btn btn-light" onClick={handleWhatsAppContact}>Contato</a>
          <button className="nav-toggle" aria-label="Abrir menu" onClick={() => setOpen(true)}>&#9776;</button>
        </div>
      </header>

      <div className={`nav-mask${open ? ' is-open' : ''}`} onClick={close} />
      <nav className={`mobile-nav${open ? ' is-open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={close}>Home</Link></li>
          <li><Link to="/estoque" onClick={close}>Estoque</Link></li>
          <li><a href={contactHref} onClick={close}>Contato</a></li>
        </ul>
        <a href={contactHref} className="btn btn-accent btn-block" onClick={close}>Contato</a>
      </nav>
    </>
  );
}
