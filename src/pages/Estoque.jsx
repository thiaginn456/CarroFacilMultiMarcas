/* =========================================================
   PÁGINA DE ESTOQUE (/estoque)
   =========================================================
   Lista todos os veículos com filtros por marca, modelo, ano
   e faixa de preço. Os filtros são aplicados em memória (useMemo)
   em cima da lista completa lida do localStorage — não tem
   busca no servidor, é tudo local.
   ========================================================= */
import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CarCard from '../components/CarCard.jsx';
import { readAll, distinctValues, filterCars, formatBRL } from '../lib/db.js';
import { useScrollReveal } from '../lib/useScrollReveal.js';

// Opções fixas do filtro de "preço máximo" (em reais).
const FAIXAS_PRECO = [50000, 80000, 120000, 200000, 400000, 700000];

export default function Estoque() {
  const [allCars, setAllCars] = useState([]); // todo o estoque, sem filtro
  const [filters, setFilters] = useState({ marca: '', modelo: '', ano: '', precoMax: '' });

  useEffect(() => {
    let active = true;
    readAll().then((cars) => { if (active) setAllCars(cars); });
    return () => { active = false; };
  }, []);

  // Opções dos selects de Marca/Modelo/Ano são geradas a partir
  // dos carros que já existem no estoque (não são fixas).
  const marcas = useMemo(() => distinctValues(allCars, 'marca'), [allCars]);
  const modelos = useMemo(() => distinctValues(allCars, 'modelo'), [allCars]);
  const anos = useMemo(() => distinctValues(allCars, 'ano').sort((a, b) => b - a), [allCars]);

  // Lista já filtrada, recalculada só quando os filtros ou o estoque mudam.
  const cars = useMemo(() => filterCars(allCars, filters), [filters, allCars]);

  useScrollReveal([cars]);

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }
  function clearFilters() {
    setFilters({ marca: '', modelo: '', ano: '', precoMax: '' });
  }

  return (
    <div className="bg-glow-soft">
      <Header />
      <div className="page-header-space" />

      <main className="section" style={{ paddingTop: 20 }}>
        <div className="wrap estoque-layout">
          <aside className="filters" data-reveal>
            <select className="filter-select" value={filters.marca} onChange={(e) => update('marca', e.target.value)}>
              <option value="">Marca</option>
              {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="filter-select" value={filters.modelo} onChange={(e) => update('modelo', e.target.value)}>
              <option value="">Modelo</option>
              {modelos.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="filter-select" value={filters.ano} onChange={(e) => update('ano', e.target.value)}>
              <option value="">Ano</option>
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="filter-select" value={filters.precoMax} onChange={(e) => update('precoMax', e.target.value)}>
              <option value="">Preço máximo</option>
              {FAIXAS_PRECO.map((v) => <option key={v} value={v}>Até R$ {formatBRL(v)}</option>)}
            </select>
            <button className="btn btn-outline" onClick={clearFilters}>Limpar filtros</button>
          </aside>

          <div>
            <div className="results-bar">
              <span>{cars.length} veículo{cars.length === 1 ? '' : 's'} encontrado{cars.length === 1 ? '' : 's'}</span>
            </div>

            {cars.length ? (
              <div className="car-grid">
                {cars.map((c) => <CarCard key={c.id} car={c} grid />)}
              </div>
            ) : (
              <div className="empty-state">
                Nenhum veículo encontrado com esses filtros.<br />
                <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={clearFilters}>Limpar filtros</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
