/* =========================================================
   PÁGINA DE DETALHE DO VEÍCULO (/carro/:id)
   =========================================================
   Mostra fotos, informações e dois jeitos de contato:
   - Botão "Negociar pelo WhatsApp" (interesse direto)
   - Formulário de simulação de financiamento
   Os dois usam openWhatsAppComVendedorAleatorio, que sorteia um
   vendedor cadastrado em Admin > Vendedores (ver lib/whatsapp.js).
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { getById, getRandomSellerWhatsApp } from '../lib/db.js';
import { openWhatsAppComVendedorAleatorio, interestMessage, financingMessage } from '../lib/whatsapp.js';
import { useScrollReveal } from '../lib/useScrollReveal.js';

const initialFinanceForm = { nome: '', whatsapp: '', sexo: '', estadoCivil: '', cpf: '', rg: '' };

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(undefined); // undefined = loading, null = not found
  const [activePhoto, setActivePhoto] = useState(null);
  const [financeForm, setFinanceForm] = useState(initialFinanceForm);
  const sellerSelectionRef = useRef(null);

  useEffect(() => {
    let active = true;
    getById(id).then((found) => {
      if (!active) return;
      setCar(found);
      setActivePhoto(found?.fotos?.[0] || null);
    });
    return () => { active = false; };
  }, [id]);

  useScrollReveal([car]);

  if (car === undefined) return null;

  if (car === null) {
    return (
      <div className="bg-glow-soft">
        <Header />
        <main style={{ paddingTop: 180, minHeight: '60vh' }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Veículo não encontrado</h2>
            <p style={{ color: 'var(--muted)', margin: '16px 0 30px' }}>
              Esse veículo pode já ter sido vendido ou removido do estoque.
            </p>
            <Link to="/estoque" className="btn btn-accent">Ver estoque completo</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fotos = car.fotos && car.fotos.length ? car.fotos : [];

  // Botão "Negociar pelo WhatsApp": conta como intenção de compra,
  // então sorteia um vendedor da lista (Admin > Vendedores).
  function getSellerSelection() {
    if (!sellerSelectionRef.current) {
      sellerSelectionRef.current = getRandomSellerWhatsApp();
    }
    return sellerSelectionRef.current;
  }

  function handleNegociar() {
    openWhatsAppComVendedorAleatorio(interestMessage(car), getSellerSelection());
  }

  // Formulário de financiamento: mesma lógica — sorteia vendedor.
  function handleFinanceSubmit(e) {
    e.preventDefault();
    
    if (!financeForm.nome || !financeForm.nome.trim()) {
      alert('Por favor, preencha seu nome.');
      return;
    }
    
    if (!financeForm.whatsapp || !financeForm.whatsapp.trim()) {
      alert('Por favor, preencha seu WhatsApp.');
      return;
    }
    
    try {
      openWhatsAppComVendedorAleatorio(financingMessage(car, financeForm), getSellerSelection()); // não precisa de await — abre a aba na hora
      setFinanceForm(initialFinanceForm);
    } catch (error) {
      console.error('Erro ao enviar financiamento:', error);
      alert('Não foi possível abrir o WhatsApp. Tente novamente.');
    }
  }

  // Filtro para aceitar apenas números
  function onlyNumbers(value) {
    return value.replace(/\D/g, '');
  }

  return (
    <div className="bg-glow-soft">
      <Header />

      <section className="section detail-hero">
        <div className="wrap detail-grid">
          <div data-reveal>
            <div className="detail-gallery-main">
              {activePhoto
                ? <img src={activePhoto} alt={car.nome} />
                : <div className="no-photo">{car.nome}</div>}
            </div>
            {fotos.length > 1 && (
              <div className="detail-thumbs">
                {fotos.map((f, i) => (
                  <img
                    key={i}
                    src={f}
                    className={f === activePhoto ? 'active' : ''}
                    onClick={() => setActivePhoto(f)}
                    alt={`${car.nome} foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div data-reveal data-reveal-delay="0.1">
            <span className="detail-panel-title">Nome do <span className="accent">veículo</span></span>
            <h1 className="detail-panel-name">{car.nome || `${car.marca} ${car.modelo}`}</h1>
            <p style={{ color: 'var(--muted)', marginTop: 10 }}>{car.informacao}</p>

            <div className="detail-specs">
              <div><div className="spec-label">{car.ano || '—'}</div><div className="spec-value">Ano</div></div>
              <div><div className="spec-label">{car.combustivel || '—'}</div><div className="spec-value">Combustível</div></div>
              <div><div className="spec-label">{car.kmRodado || '—'} km</div><div className="spec-value">KM</div></div>
              <div><div className="spec-label">{car.cor || '—'}</div><div className="spec-value">Cor</div></div>
              <div><div className="spec-label">{car.placaFinal || '—'}</div><div className="spec-value">Placa final</div></div>
              <div><div className="spec-label">{car.categoria || '—'}</div><div className="spec-value">Categoria</div></div>
            </div>

            <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleNegociar}>
              Negociar pelo WhatsApp
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 1000 }}>
          <div className="finance-card" data-reveal>
            <span className="eyebrow">Precisa <span className="accent">financiar?</span></span>
            <h3 className="finance-title">Aprove sua ficha de <span className="accent">financiamento</span> conosco!</h3>
            <form onSubmit={handleFinanceSubmit}>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="fNome">Nome</label>
                  <input type="text" id="fNome" required
                    value={financeForm.nome} onChange={(e) => setFinanceForm({ ...financeForm, nome: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="fWhats">WhatsApp (apenas números)</label>
                  <input type="tel" id="fWhats" required
                    placeholder="5543900000000"
                    inputMode="numeric"
                    maxLength="13"
                    value={financeForm.whatsapp} onChange={(e) => setFinanceForm({ ...financeForm, whatsapp: onlyNumbers(e.target.value) })} />
                </div>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="fSexo">Sexo</label>
                  <select id="fSexo" value={financeForm.sexo} onChange={(e) => setFinanceForm({ ...financeForm, sexo: e.target.value })}>
                    <option value="">Selecione</option>
                    <option>Feminino</option>
                    <option>Masculino</option>
                    <option>Prefiro não informar</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fEstadoCivil">Estado civil</label>
                  <select id="fEstadoCivil" value={financeForm.estadoCivil} onChange={(e) => setFinanceForm({ ...financeForm, estadoCivil: e.target.value })}>
                    <option value="">Selecione</option>
                    <option>Solteiro(a)</option>
                    <option>Casado(a)</option>
                    <option>Divorciado(a)</option>
                    <option>Viúvo(a)</option>
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="fCpf">CPF (apenas números)</label>
                  <input type="text" id="fCpf" placeholder="00000000000" maxLength="11"
                    inputMode="numeric"
                    value={financeForm.cpf} onChange={(e) => setFinanceForm({ ...financeForm, cpf: onlyNumbers(e.target.value) })} />
                </div>
                <div className="field">
                  <label htmlFor="fRg">RG (apenas números)</label>
                  <input type="text" id="fRg" maxLength="20"
                    inputMode="numeric"
                    value={financeForm.rg} onChange={(e) => setFinanceForm({ ...financeForm, rg: onlyNumbers(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="btn btn-accent btn-block">Enviar!</button>
              <p className="form-note">Seus dados serão enviados por WhatsApp diretamente para nossa equipe de financiamento.</p>
            </form>
            <div className="hours">
              <div><b>Segunda à sexta</b> — 08:00 às 19:00</div>
              <div><b>Sábado</b> — 08:00 às 13:30</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
