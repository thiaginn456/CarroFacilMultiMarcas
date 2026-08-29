/**
 * Aviso ("toast") que some sozinho depois de alguns segundos —
 * usado no Admin pra confirmar ações (ex: "Veículo publicado!").
 * `visible` controla a animação de entrada/saída via CSS.
 */
export default function Toast({ message, visible }) {
  return (
    <div className={`toast${visible ? ' is-visible' : ''}`}>{message}</div>
  );
}
