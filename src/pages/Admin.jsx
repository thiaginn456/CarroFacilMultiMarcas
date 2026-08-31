/* =========================================================
   PAINEL DO ADMINISTRADOR (/admin)
   =========================================================
  Os dados ficam no Supabase e o acesso é protegido pelo Supabase Auth.

   Este arquivo tem 3 partes principais:
   1) Tela de login (senha + proteção contra força bruta)
   2) Gestão de veículos (adicionar / listar / excluir)
   3) Gestão de vendedores (novo!) — cadastro de WhatsApp de cada
      vendedor, usados para sortear quem recebe cada lead
   4) Troca de senha do admin

   Se `loggedIn` for false, só a tela de login é renderizada
   (return antecipado lá embaixo). O resto do componente só
   roda depois que a pessoa entra com a senha certa.
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';
import {
  readAll, addCar, deleteCar, uploadFotos, placeholderSvg,
  prepareImageForWeb,
  getAdminSession, signInAdmin, signOutAdmin, updateAdminPassword,
  readSellers, addSeller, deleteSeller
} from '../lib/db.js';

const emptyCarForm = {
  marca: '', modelo: '', nome: '', informacao: '', ano: '', km: '',
  combustivel: '', cor: '', categoria: '', placaFinal: ''
};

const onlyNumbers = (value) => value.replace(/\D/g, '');
const onlyDecimalNumbers = (value) => value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [checkingLogin, setCheckingLogin] = useState(false);

  const [cars, setCars] = useState([]);
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '' });

  // ---- Vendedores (distribuição aleatória de leads no WhatsApp) ----
  const [sellers, setSellers] = useState([]);
  const [sellerForm, setSellerForm] = useState({ nome: '', whatsapp: '' });
  const [sellerError, setSellerError] = useState('');
  const [pendingDeleteSellerId, setPendingDeleteSellerId] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    getAdminSession().then((session) => {
      if (session) {
      setLoggedIn(true);
      setAdminEmail(session.user.email || '');
      readAll().then(setCars);
      readSellers().then(setSellers);
      }
    });
  }, []);

  // Confirma periodicamente que a sessão do Supabase continua válida.
  useEffect(() => {
    if (!loggedIn) return;
    const t = setInterval(() => {
      getAdminSession().then((session) => {
      if (!session) {
        setLoggedIn(false);
        showToast('Sessão expirada. Faça login novamente.');
      }
      });
    }, 5000);
    return () => {
      clearInterval(t);
    };
  }, [loggedIn]);

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setCheckingLogin(true);
    const { error } = await signInAdmin(email.trim(), pass);
    setCheckingLogin(false);
    if (!error) {
      setLoggedIn(true);
      setAdminEmail(email.trim());
      readAll().then(setCars);
      readSellers().then(setSellers);
      setLoginError('');
      setEmail('');
      setPass('');
    } else {
      setLoginError('Email ou senha incorretos.');
    }
  }

  async function handleLogout() {
    await signOutAdmin();
    setLoggedIn(false);
    setPass('');
  }

  // Cada foto escolhida vira { file, preview } — `file` (o arquivo de
  // verdade) é enviado ao Supabase Storage só quando o formulário é
  // publicado; `preview` (URL temporária local) é só pra mostrar a
  // miniatura na hora, sem precisar subir nada ainda.
  async function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    const preparedFiles = await Promise.all(files.map(prepareImageForWeb));
    setPhotos((prev) => [...prev, ...preparedFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(i) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleCarSubmit(e) {
    e.preventDefault();
    setPublishing(true);
    try {
      const urls = await uploadFotos(photos.map((p) => p.file));
      await addCar({
        marca: carForm.marca.trim(),
        modelo: carForm.modelo.trim(),
        nome: carForm.nome.trim(),
        informacao: carForm.informacao.trim(),
        ano: carForm.ano.trim(),
        kmRodado: carForm.km.trim(),
        combustivel: carForm.combustivel,
        cor: carForm.cor.trim(),
        categoria: carForm.categoria.trim(),
        placaFinal: carForm.placaFinal.trim(),
        fotos: urls
      });
      setCarForm(emptyCarForm);
      setPhotos([]);
      setCars(await readAll());
      showToast('Veículo publicado no estoque!');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível publicar o veículo. Tente novamente.');
    } finally {
      setPublishing(false);
    }
  }

  async function handlePassSubmit(e) {
    e.preventDefault();
    setPassError('');
    if (newPass.length < 6) {
      setPassError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('A confirmação não coincide com a nova senha.');
      return;
    }
    const { error } = await updateAdminPassword(newPass);
    if (error) {
      setPassError('Não foi possível atualizar a senha.');
      return;
    }
    setNewPass('');
    setConfirmPass('');
    showToast('Senha atualizada!');
  }

  async function confirmDelete(password) {
    setDeleteError('');
    const { error } = await signInAdmin(adminEmail, password);
    if (error) {
      setDeleteError('Senha incorreta.');
      return;
    }
    if (pendingDeleteId) {
      await deleteCar(pendingDeleteId);
      setCars(await readAll());
      showToast('Veículo removido do estoque.');
    }
    setDeletePassword('');
    setPendingDeleteId(null);
  }

  // ---- Vendedores: cadastrar e excluir ----
  async function handleSellerSubmit(e) {
    e.preventDefault();
    setSellerError('');
    const nome = sellerForm.nome.trim();
    const numeroLimpo = sellerForm.whatsapp.replace(/\D/g, ''); // guarda só os dígitos
    if (!nome) {
      setSellerError('Informe o nome do vendedor.');
      return;
    }
    // DDI (55) + DDD (2) + número (8 ou 9) = 12 a 13 dígitos no total.
    if (numeroLimpo.length < 12 || numeroLimpo.length > 13) {
      setSellerError('WhatsApp inválido. Use o formato com DDI e DDD, ex: 5543999998888.');
      return;
    }
    await addSeller({ nome, whatsapp: numeroLimpo });
    setSellers(await readSellers());
    setSellerForm({ nome: '', whatsapp: '' });
    showToast('Vendedor cadastrado!');
  }

  async function confirmDeleteSeller(password) {
    setDeleteError('');
    const { error } = await signInAdmin(adminEmail, password);
    if (error) {
      setDeleteError('Senha incorreta.');
      return;
    }
    if (pendingDeleteSellerId) {
      await deleteSeller(pendingDeleteSellerId);
      setSellers(await readSellers());
      showToast('Vendedor removido.');
    }
    setDeletePassword('');
    setPendingDeleteSellerId(null);
  }

  if (!loggedIn) {
    return (
      <div className="bg-glow-soft admin-gate">
        <div className="admin-gate-card">
          <Link to="/" className="logo">
            <img src={logo} alt="Carro Fácil Multimarcas" />
          </Link>
          <p>Área restrita ao proprietário. Entre com sua conta para gerenciar o estoque.</p>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email" id="email" autoComplete="username" required
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="pass">Senha</label>
              <input
                type="password" id="pass" autoComplete="current-password" required
                value={pass} onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-accent btn-block" disabled={checkingLogin}>
              {checkingLogin ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
          <div className="admin-error">{loginError}</div>
          <Link to="/" style={{ display: 'inline-block', marginTop: 20, fontSize: 12.5, color: 'var(--muted)' }}>
            &larr; Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell is-visible">
      <div className="admin-top">
        <div className="wrap">
          <Link to="/" className="logo">
            <img src={logo} alt="Carro Fácil Multimarcas" />
            <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 6 }}>painel</span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/" className="btn btn-outline">Ver site</Link>
            <button className="btn btn-dark" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </div>

      <div className="wrap admin-body">
        <div className="admin-layout">
          {/* ADD CAR */}
          <section className="panel">
            <h3>Adicionar veículo</h3>
            <p className="panel-sub">Preencha os dados para publicar um novo carro no estoque.</p>
            <form onSubmit={handleCarSubmit}>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="marca">Marca</label>
                  <input type="text" id="marca" required placeholder="Ex: Volkswagen"
                    value={carForm.marca} onChange={(e) => setCarForm({ ...carForm, marca: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="modelo">Modelo</label>
                  <input type="text" id="modelo" required placeholder="Ex: Nivus Highline"
                    value={carForm.modelo} onChange={(e) => setCarForm({ ...carForm, modelo: e.target.value })} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="nome">Nome do anúncio</label>
                <input type="text" id="nome" required placeholder="Ex: VW Nivus Highline 2022"
                  value={carForm.nome} onChange={(e) => setCarForm({ ...carForm, nome: e.target.value })} />
              </div>

              <div className="field">
                <label htmlFor="informacao">Informação do carro</label>
                <textarea id="informacao" placeholder="Detalhes, opcionais, estado de conservação..."
                  value={carForm.informacao} onChange={(e) => setCarForm({ ...carForm, informacao: e.target.value })} />
              </div>

              <div className="two-col">
                <div className="field">
                  <label htmlFor="ano">Ano</label>
                  <input type="text" id="ano" required placeholder="2022"
                    inputMode="numeric" value={carForm.ano}
                    onChange={(e) => setCarForm({ ...carForm, ano: onlyNumbers(e.target.value) })} />
                </div>
                <div className="field">
                  <label htmlFor="km">KM rodado</label>
                  <input type="text" id="km" required placeholder="32.100"
                    inputMode="numeric" value={carForm.km}
                    onChange={(e) => setCarForm({ ...carForm, km: onlyNumbers(e.target.value) })} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="combustivel">Combustível</label>
                <select id="combustivel"
                  value={carForm.combustivel} onChange={(e) => setCarForm({ ...carForm, combustivel: e.target.value })}>
                  <option value="">Selecione</option>
                  <option>Flex</option><option>Gasolina</option><option>Etanol</option>
                  <option>Diesel</option><option>Híbrido</option><option>Elétrico</option>
                </select>
              </div>

              <div className="two-col">
                <div className="field">
                  <label htmlFor="cor">Cor</label>
                  <input type="text" id="cor" placeholder="Branco"
                    value={carForm.cor} onChange={(e) => setCarForm({ ...carForm, cor: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="categoria">Categoria</label>
                  <input type="text" id="categoria" placeholder="SUV, Sedã, Hatch..."
                    value={carForm.categoria} onChange={(e) => setCarForm({ ...carForm, categoria: e.target.value })} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="placaFinal">Placa final</label>
                <input type="text" id="placaFinal" maxLength={1} placeholder="Ex: 4" style={{ maxWidth: 120 }}
                  inputMode="numeric" value={carForm.placaFinal}
                  onChange={(e) => setCarForm({ ...carForm, placaFinal: onlyNumbers(e.target.value) })} />
              </div>

              <div className="field">
                <label>Fotos do carro</label>
                <label className="upload-box">
                  Clique para escolher fotos (várias) ou arraste aqui
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                </label>
                {photos.length > 0 && (
                  <div className="photo-preview-row">
                    {photos.map((p, i) => (
                      <div className="photo-preview" key={i}>
                        <img src={p.preview} alt="" />
                        <button type="button" aria-label="Remover foto" onClick={() => removePhoto(i)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-accent btn-block" disabled={publishing}>
                {publishing ? 'Publicando...' : 'Publicar veículo'}
              </button>
            </form>
          </section>

          {/* LIST / DELETE */}
          <section className="panel">
            <h3>Veículos no estoque ({cars.length})</h3>
            <p className="panel-sub">Remova os veículos já vendidos.</p>
            <div className="admin-car-list">
              {cars.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Nenhum veículo cadastrado.</p>
              )}
              {cars.map((c) => (
                <div className="admin-car-row" key={c.id}>
                  <img src={(c.fotos && c.fotos[0]) || placeholderSvg(c.nome)} alt="" />
                  <div className="info">
                    <div className="name">{c.nome}</div>
                    <div className="meta">{c.ano} · {c.kmRodado} km</div>
                  </div>
                  <button className="btn btn-danger" onClick={() => {
                    setDeletePassword('');
                    setDeleteError('');
                    setPendingDeleteId(c.id);
                  }}>Excluir</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* VENDEDORES — distribuição aleatória de leads no WhatsApp */}
        <section className="panel" style={{ marginTop: 30 }}>
          <h3>Vendedores</h3>
          <p className="panel-sub">
            Cadastre o WhatsApp de cada vendedor. Toda vez que um cliente clicar em
            "Negociar pelo WhatsApp" ou enviar a ficha de financiamento na página de um carro,
            o site sorteia um vendedor da lista abaixo e manda o cliente direto pra ele —
            assim os leads ficam divididos entre a equipe. Se a lista estiver vazia, o site
            usa o WhatsApp padrão da loja (definido em src/lib/whatsapp.js).
          </p>
          <form onSubmit={handleSellerSubmit} className="two-col" style={{ alignItems: 'flex-end' }}>
            <div className="field">
              <label htmlFor="sellerNome">Nome do vendedor</label>
              <input type="text" id="sellerNome" placeholder="Ex: João"
                value={sellerForm.nome} onChange={(e) => setSellerForm({ ...sellerForm, nome: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="sellerWhats">WhatsApp (com DDI e DDD)</label>
              <input type="tel" id="sellerWhats" placeholder="5543999998888"
                inputMode="numeric" maxLength={13}
                value={sellerForm.whatsapp}
                onChange={(e) => setSellerForm({ ...sellerForm, whatsapp: onlyNumbers(e.target.value) })} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              {sellerError && <div className="admin-error" style={{ marginBottom: 10 }}>{sellerError}</div>}
              <button type="submit" className="btn btn-accent btn-block">Adicionar vendedor</button>
            </div>
          </form>

          <div className="admin-car-list" style={{ marginTop: 20 }}>
            {sellers.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
                Nenhum vendedor cadastrado — os leads vão todos para o WhatsApp padrão da loja.
              </p>
            )}
            {sellers.map((s) => (
              <div className="admin-car-row" key={s.id}>
                <div className="info">
                  <div className="name">{s.nome}</div>
                  <div className="meta">+{s.whatsapp}</div>
                </div>
                <button className="btn btn-danger" onClick={() => {
                  setDeletePassword('');
                  setDeleteError('');
                  setPendingDeleteSellerId(s.id);
                }}>Excluir</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ marginTop: 30, maxWidth: 420 }}>
          <h3>Alterar senha</h3>
          <form onSubmit={handlePassSubmit}>
            <div className="field">
              <label htmlFor="newPass">Nova senha</label>
              <input type="password" id="newPass" autoComplete="new-password" minLength={6} required
                value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="confirmPass">Confirmar nova senha</label>
              <input type="password" id="confirmPass" autoComplete="new-password" minLength={6} required
                value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>
            {passError && <div className="admin-error">{passError}</div>}
            <button type="submit" className="btn btn-outline btn-block">Atualizar senha</button>
          </form>
        </section>
      </div>

      <ConfirmModal
        open={!!pendingDeleteId}
        title="Excluir veículo?"
        message="Essa ação não pode ser desfeita. Use apenas para veículos já vendidos ou removidos do estoque."
        password={deletePassword}
        onPasswordChange={setDeletePassword}
        error={deleteError}
        onCancel={() => {
          setDeletePassword('');
          setDeleteError('');
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
      <ConfirmModal
        open={!!pendingDeleteSellerId}
        title="Excluir vendedor?"
        message="Esse vendedor deixa de receber leads sorteados a partir de agora."
        password={deletePassword}
        onPasswordChange={setDeletePassword}
        error={deleteError}
        onCancel={() => {
          setDeletePassword('');
          setDeleteError('');
          setPendingDeleteSellerId(null);
        }}
        onConfirm={confirmDeleteSeller}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
