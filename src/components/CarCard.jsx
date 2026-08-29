/**
 * Card de um veículo (usado na Home e na página de Estoque).
 * `grid`: true = card no grid da página de Estoque (estilo levemente
 * diferente do carrossel da Home).
 * `revealDelay`: atraso da animação de entrada (ver useScrollReveal.js).
 */
import { Link } from 'react-router-dom';
import { CalendarDays, Gauge } from 'lucide-react';
import { formatBRL } from '../lib/db.js';

export default function CarCard({ car, grid = false, revealDelay }) {
  const photo = car.fotos && car.fotos[0]; // sempre usa a 1ª foto cadastrada como capa

  return (
    <Link
      to={`/carro/${car.id}`}
      className={`car-card${grid ? ' grid-item' : ''}`}
      data-reveal
      data-reveal-delay={revealDelay}
    >
      <div className="car-card-media">
        {photo
          ? <img src={photo} alt={car.nome} loading="lazy" />
          : <div className="no-photo">{car.nome || car.modelo || 'CARRO FÁCIL'}</div>}
      </div>
      <div className="car-card-body">
        <div>
          <div className="car-card-name">{car.nome || `${car.marca} ${car.modelo}`}</div>
          <div className="car-card-info">{car.informacao || ''}</div>
        </div>
        <div className="car-card-meta">
          <div className="row"><span><Gauge className="car-card-icon" size={15} strokeWidth={2.2} aria-hidden="true" /> {car.kmRodado || '-'} km</span></div>
          <div className="row">
            <span><CalendarDays className="car-card-icon" size={15} strokeWidth={2.2} aria-hidden="true" /> {car.ano || '-'}</span>
            <span className="car-card-price">R$ {formatBRL(car.valor)}</span>
          </div>
        </div>
        <span className="btn btn-dark btn-block">Negociar</span>
      </div>
    </Link>
  );
}
