/**
 * =========================================================
 * Rodapé do site (aparece em todas as páginas)
 * =========================================================
 * Tem: logo, links de redes sociais, tagline (opcional, só
 * aparece na Home) e a linha de copyright + link discreto pra
 * área do administrador.
 *
 * Pra trocar os links das redes sociais, edite as constantes
 * abaixo. O ícone do WhatsApp usa um vendedor cadastrado no Admin.
 */
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { openWhatsAppComVendedorObrigatorio } from '../lib/whatsapp.js';
import { InstagramIcon, FacebookIcon, WhatsappIcon } from './SocialIcons.jsx';

const INSTAGRAM_URL = 'https://www.instagram.com/carrofacilsiq.jt/';
const FACEBOOK_URL = 'https://www.facebook.com/carrofacilsiq.jt/?locale=pt_BR';

export default function Footer({ tagline = false }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link to="/" className="logo">
              <img src={logo} alt="Carro Fácil Multimarcas" />
            </Link>
            {tagline && <span className="eyebrow" style={{ display: 'block', marginTop: 14 }}>Cheque nossas redes!</span>}
            <div className="social-row">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a
                href="#whatsapp"
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsAppComVendedorObrigatorio('Olá! Gostaria de saber mais sobre os veículos da Carro Fácil.');
                }}
                aria-label="WhatsApp"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>
          {tagline && (
            <div className="footer-tagline">
              <div><span className="brand">CARRO</span> FÁCIL</div>
              <div>Aqui seu sonho <span className="brand">acaba</span> e vira <span className="brand">realidade</span></div>
            </div>
          )}
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Carro Fácil Multimarcas. Todos os direitos reservados.</span>
          <Link to="/admin" style={{ opacity: .5 }}>Área do proprietário</Link>
        </div>
      </div>
    </footer>
  );
}
