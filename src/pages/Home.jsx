/* =========================================================
   PÁGINA INICIAL (Home)
   =========================================================
   Seções, de cima pra baixo:
   1) Header (menu)
   2) Hero — vídeo 360º do carro controlado pelo scroll (GSAP)
   3) Estoque em destaque (carrossel com os 8 carros mais recentes)
   4) Sobre / valores da empresa
   5) "Conheça nossa empresa" — carrossel de vídeos do Instagram
   6) Formulário de contato geral (vai pro WhatsApp padrão da loja)
   7) Footer
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CarCard from '../components/CarCard.jsx';
import InstagramCarousel from '../components/InstagramCarousel.jsx';
import { readAll } from '../lib/db.js';
import { openWhatsAppComVendedorObrigatorio, contactMessage } from '../lib/whatsapp.js';
import { ScrollTrigger, useScrollReveal } from '../lib/useScrollReveal.js';
import { instagramVideos } from '../lib/instagramVideos.js';
import heroVideo from '../assets/hero-car.mp4';
import logoMark from '../assets/logo.png';

export default function Home() {
  const { hash } = useLocation();
  const [cars, setCars] = useState([]);
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const stageWrapRef = useRef(null);
  const [form, setForm] = useState({ nome: '', whatsapp: '', mensagem: '' });
  const [heroFinished, setHeroFinished] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 760);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    readAll().then((all) => { if (active) setCars(all.slice(0, 8)); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (hash !== '#contato') return undefined;

    const scrollToContact = () => {
      document.getElementById('contato')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    const frame = requestAnimationFrame(scrollToContact);
    const retry = window.setTimeout(scrollToContact, 120);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
    };
  }, [hash]);

  useScrollReveal([cars]);

  /* ---------------- hero: vídeo controlado pelo scroll com sincronização suave ---------------- */
  useEffect(() => {
    const stage = stageWrapRef.current;
    const video = videoRef.current;
    if (!stage || !video) return undefined;

    let ready = false;
    let triggers = [];

    function buildTimeline() {
      const duration = video.duration || 5;

      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          setHeroFinished(self.progress >= 0.999);
          if (!ready) return;
          const targetTime = self.progress * duration;
          if (!isNaN(targetTime)) {
            try { video.currentTime = targetTime; } catch (e) { /* noop */ }
          }
        }
      });
      triggers.push(st);
    }

    function onMeta() {
      // Aguarda vídeo estar pronto antes de iniciar
      if (video.readyState >= 2) {
        ready = true;
        buildTimeline();
        ScrollTrigger.refresh();
      }
    }

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('canplay', onMeta);
    video.preload = 'auto';
    video.load();
    
    if (video.readyState >= 2) onMeta();

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('canplay', onMeta);
      triggers.forEach((t) => t && t.kill());
    };
  }, []);

  function handleCarouselNav(dir) {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    
    // Validação clara
    if (!form.nome || !form.nome.trim()) {
      alert('Por favor, digite seu nome.');
      return;
    }
    
    if (!form.whatsapp || !form.whatsapp.trim()) {
      alert('Por favor, digite seu WhatsApp.');
      return;
    }

    // Abre WhatsApp com a mensagem
    try {
      openWhatsAppComVendedorObrigatorio(contactMessage({
        nome: form.nome.trim(),
        whatsapp: form.whatsapp.trim(),
        mensagem: form.mensagem.trim()
      }));
      
      // Limpa o formulário após sucesso
      setForm({ nome: '', whatsapp: '', mensagem: '' });
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      alert('Não foi possível abrir o WhatsApp. Tente novamente.');
    }
  }

  // Filtro para aceitar apenas números
  function onlyNumbers(value) {
    return value.replace(/\D/g, '');
  }

  return (
    <div className="bg-glow">
      <Header heroFinished={heroFinished} />

      {/* ===================== HERO — vídeo 360º controlado pelo scroll ===================== */}
      <section className="hero-pin" ref={stageWrapRef}>
        <div className={`hero-stage${isMobile ? ' hero-stage-mobile' : ''}`}>
          <video ref={videoRef} className={`hero-video${isMobile ? ' hero-video-mobile' : ''}`} src={heroVideo} muted playsInline preload="auto" />
          <div className="hero-veil" />
        </div>
      </section>

      {/* ===================== ESTOQUE EM DESTAQUE ===================== */}
      <section className="section bg-glow-soft" id="destaques">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'left', maxWidth: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18, marginBottom: 36 }}>
            <div data-reveal>
              <span className="eyebrow">Estoque</span>
              <h2 className="section-title">Os melhores <span className="accent">veículos</span><br />você encontra aqui!</h2>
            </div>
            <a href={`${import.meta.env.BASE_URL}estoque`} className="btn btn-outline" data-reveal>Ver estoque completo</a>
          </div>

          <div className="carousel">
            <button className="carousel-arrow prev" aria-label="Anterior" onClick={() => handleCarouselNav(-1)}>&#10094;</button>
            <div className="carousel-track" ref={trackRef}>
              {cars.length
                ? cars.map((c) => <CarCard key={c.id} car={c} />)
                : <p style={{ color: 'var(--muted)' }}>Nenhum veículo cadastrado ainda.</p>}
            </div>
            <button className="carousel-arrow next" aria-label="Próximo" onClick={() => handleCarouselNav(1)}>&#10095;</button>
          </div>
        </div>
      </section>

      {/* ===================== SOBRE / VALORES ===================== */}
      <section className="brand-strip wrap">
        <div data-reveal>
          <div className="logo-lockup" style={{ margin: '0 auto' }}>
            <img src={logoMark} alt="Carro Fácil" />
          </div>
          <p>Nós da Carro Fácil Multimarcas temos como valores ética, comprometimento, excelência nos negócios, pessoas, comunicação, inovação e melhorias sempre.</p>
        </div>
      </section>

      {/* ===================== CONHEÇA NOSSA EMPRESA ===================== */}
      <section className="section" id="empresa">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Bastidores</span>
            <h2 className="section-title">Conheça nossa <span className="accent">empresa</span></h2>
            <p style={{ color: 'var(--muted)', marginTop: 18, maxWidth: 620, lineHeight: 1.7, marginLeft: 'auto', marginRight: 'auto' }}>
              Veja nossos reels e bastidores no Instagram! Confira os melhores momentos da Carro Fácil Multimarcas.
            </p>
          </div>
          <div data-reveal-group>
            <InstagramCarousel videos={instagramVideos} />
          </div>
        </div>
      </section>

      {/* ===================== CONTATO ===================== */}
      <section className="section bg-glow-soft" id="contato">
        <div className="wrap contact-grid">
          <div data-reveal>
            <span className="eyebrow">Fale com a gente</span>
            <h2 className="section-title" style={{ marginTop: 10 }}>Entre em <span className="accent">contato</span><br />com nossa equipe!</h2>
            <p style={{ color: 'var(--muted)', marginTop: 18, maxWidth: 420, lineHeight: 1.7 }}>
              Aqui faremos <span className="accent" style={{ fontFamily: 'var(--ff-display)', fontWeight: 700 }}>acontecer!</span> Preencha o formulário e falamos com você pelo WhatsApp.
            </p>
            <div className="hours">
              <div><b>Segunda à sexta</b> — 08:00 às 19:00</div>
              <div><b>Sábado</b> — 08:00 às 13:30</div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} data-reveal>
            <div className="field">
              <label htmlFor="cNome">Nome</label>
              <input type="text" id="cNome" placeholder="Seu nome" required
                value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="cWhats">WhatsApp (apenas números)</label>
              <input type="tel" id="cWhats" placeholder="5543900000000" required
                inputMode="numeric"
                maxLength="13"
                value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: onlyNumbers(e.target.value) })} />
            </div>
            <div className="field">
              <label htmlFor="cMsg">Mensagem</label>
              <textarea id="cMsg" placeholder="Conte pra gente o que você procura..."
                value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-accent btn-block">Enviar!</button>
            <p className="form-note">Ao enviar, abriremos o WhatsApp da loja com sua mensagem já preenchida.</p>
          </form>
        </div>
      </section>

      <Footer tagline />
    </div>
  );
}
