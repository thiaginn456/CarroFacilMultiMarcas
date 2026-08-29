/* =========================================================
   App raiz — define as rotas do site com React Router.
   =========================================================
   / (Home), /estoque (lista completa), /carro/:id (detalhe de
   um veículo), /admin (painel do administrador).
   <ScrollToTop /> fica fora das <Routes> de propósito: ele só
   escuta a rota atual e rola a página pro topo a cada troca.
   ========================================================= */
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import Estoque from './pages/Estoque.jsx';
import CarDetail from './pages/CarDetail.jsx';
import Admin from './pages/Admin.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

const baseName = import.meta.env.BASE_URL.replace(/\/$/, '');

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get('p');

    if (path && path !== location.pathname) {
      navigate(path, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/carro/:id" element={<CarDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={baseName}>
      <AppRoutes />
    </BrowserRouter>
  );
}
