/* =========================================================
   Ponto de entrada da aplicação React.
   Monta o componente <App /> dentro da <div id="root"> do
   index.html. StrictMode ajuda a pegar bugs comuns em
   desenvolvimento (roda alguns efeitos 2x só em dev, não afeta
   produção).
   ========================================================= */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
