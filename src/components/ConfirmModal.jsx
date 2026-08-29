/**
 * Modal genérico de confirmação (usado em Admin.jsx pra confirmar
 * exclusão de veículos e de vendedores). `open` controla se ele
 * aparece; `onCancel`/`onConfirm` são chamados pelos botões.
 */
export default function ConfirmModal({
  open, title, message, onCancel, onConfirm, password, onPasswordChange, error
}) {
  return (
    <div className={`confirm-mask${open ? ' is-visible' : ''}`}>
      <div className="confirm-box">
        <h3 style={{ fontSize: 16 }}>{title}</h3>
        <p>{message}</p>
        <input
          type="password"
          placeholder="Digite sua senha para confirmar"
          autoComplete="current-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoFocus={open}
        />
        {error && <div className="admin-error">{error}</div>}
        <div className="confirm-actions">
          <button className="btn btn-outline btn-block" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger btn-block" onClick={() => onConfirm(password)}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
