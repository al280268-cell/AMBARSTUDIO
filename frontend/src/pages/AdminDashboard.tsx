import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { User, Provider, ChatMessage, ChatSession } from '../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Chat interception
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    Promise.all([fetchUsers(), fetchProviders(), fetchChatSessions()])
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const fetchProviders = async () => {
    try {
      const data = await api.getAllProviders();
      setProviders(data);
    } catch (e) { console.error(e); }
  };

  const fetchChatSessions = async () => {
    try {
      const data = await api.getChatSessions();
      setChatSessions(data);
    } catch (e) { console.error(e); }
  };

  const loadChatHistory = async (userId: number) => {
    try {
      const data = await api.getAdminChatHistory(userId);
      setChatHistory(data);
      setActiveSession(userId);
    } catch (e) { console.error(e); }
  };

  const sendAdminMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim() || !activeSession) return;
    try {
      await api.sendAdminMessage(activeSession, adminMessage);
      setAdminMessage("");
      loadChatHistory(activeSession);
    } catch (e) { console.error(e); }
  };

  const regularUsers = users.filter(u => u.role === 'user');
  const providerUsers = users.filter(u => u.role === 'provider');
  const totalTokens = users.reduce((sum, u) => sum + (u.tokens_balance || 0), 0);
  const avgRating = providers.length > 0 ? (providers.reduce((s, p) => s + p.rating, 0) / providers.length).toFixed(1) : '—';
  const verifiedCount = providers.filter(p => p.verified).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const tabs = [
    { id: 'overview', icon: 'dashboard', label: 'Resumen' },
    { id: 'users', icon: 'group', label: 'Clientes' },
    { id: 'providers', icon: 'storefront', label: 'Proveedores' },
    { id: 'chat', icon: 'smart_toy', label: 'IA Chat' },
  ];

  if (loading) return <main style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></main>;

  return (
    <main className="page-animate" style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface-container-low)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px rgba(45,106,79,0.5)' }} />
              <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--success)', fontWeight: 700 }}>Sistema Activo</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 40, color: 'var(--primary)', marginBottom: 6 }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ color: 'var(--secondary)', fontSize: 15 }}>Panel de control de AMBAR STUDIO — Aguascalientes</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white', fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>admin_panel_settings</span>
              Administrador
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {tabs.map(t => (
            <button key={t.id} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(t.id)} style={{ borderRadius: 'var(--radius-full)', fontSize: 11, padding: '10px 20px', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in-up">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { icon: 'group', label: 'Clientes', value: regularUsers.length, color: '#2d6a4f', bg: '#e8f5e9' },
                { icon: 'storefront', label: 'Proveedores', value: providers.length, color: '#0A1F18', bg: '#E0F2E9' },
                { icon: 'token', label: 'Tokens Activos', value: totalTokens.toLocaleString(), color: '#C28E72', bg: '#fef3ec' },
                { icon: 'star', label: 'Rating Promedio', value: avgRating, color: '#8C7A6B', bg: '#F4F1ED' },
                { icon: 'verified', label: 'Verificados', value: verifiedCount, color: '#2d6a4f', bg: '#e8f5e9' },
                { icon: 'chat', label: 'Sesiones Chat', value: chatSessions.length, color: '#5c6bc0', bg: '#e8eaf6' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined filled" style={{ color: s.color, fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick View: Recent Users + Top Providers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)' }}>Clientes Recientes</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('users')} style={{ fontSize: 10 }}>Ver todos →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {regularUsers.slice(0, 5).map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 14, color: 'var(--primary)', flexShrink: 0 }}>
                        {u.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--secondary)' }}>{u.email}</div>
                      </div>
                      <span className="badge badge-soft" style={{ fontSize: 10 }}>{u.plan}</span>
                    </div>
                  ))}
                  {regularUsers.length === 0 && <p style={{ fontSize: 13, color: 'var(--secondary)', textAlign: 'center', padding: 20 }}>Sin clientes aún</p>}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)' }}>Top Proveedores</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('providers')} style={{ fontSize: 10 }}>Ver todos →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {providers.slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>storefront</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>{p.business_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--secondary)' }}>{p.city} · {p.categories?.join(', ')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined filled" style={{ fontSize: 14, color: 'var(--terracota)' }}>star</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{p.rating}</span>
                      </div>
                    </div>
                  ))}
                  {providers.length === 0 && <p style={{ fontSize: 13, color: 'var(--secondary)', textAlign: 'center', padding: 20 }}>Sin proveedores</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card animate-fade-in-up" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', color: 'var(--primary)' }}>Clientes Registrados</h2>
              <span className="badge badge-soft">{regularUsers.length} clientes</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="token-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Ciudad</th><th>Plan</th><th>Tokens</th></tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.city}</td>
                      <td><span className="badge badge-soft">{u.plan}</span></td>
                      <td style={{ fontWeight: 700, color: u.tokens_balance > 0 ? 'var(--primary)' : 'var(--error)' }}>{u.tokens_balance}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No hay clientes registrados.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="card animate-fade-in-up" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', color: 'var(--primary)' }}>Directorio de Proveedores</h2>
              <span className="badge badge-soft">{providers.length} proveedores · {verifiedCount} verificados</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="token-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>Negocio</th><th>Contacto</th><th>Ciudad</th><th>Categorías</th><th>Rating</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {providers.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.image_url ? <img src={p.image_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : null}
                          <strong>{p.business_name}</strong>
                        </div>
                      </td>
                      <td>{p.user_name}</td>
                      <td>{p.city}</td>
                      <td>{p.categories?.join(', ')}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined filled" style={{ fontSize: 14, color: 'var(--terracota)' }}>star</span>
                          {p.rating}
                        </span>
                      </td>
                      <td>
                        {p.verified ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 700, fontSize: 12 }}>
                            <span className="status-dot online" /> Verificado
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--terracota)', fontSize: 12 }}>
                            <span className="status-dot warning" /> Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {providers.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No hay proveedores registrados.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="card animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 600, overflow: 'hidden' }}>
            <div style={{ borderRight: '1px solid var(--outline-variant)', padding: 16, overflowY: 'auto', background: 'var(--surface-container-low)' }}>
              <h3 style={{ fontFamily: 'var(--font-label)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }}>forum</span>
                Sesiones Activas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chatSessions.map(session => (
                  <div
                    key={session.user_id}
                    onClick={() => loadChatHistory(session.user_id)}
                    style={{
                      padding: 12, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: activeSession === session.user_id ? 'var(--surface-container-highest)' : 'var(--surface-container-lowest)',
                      border: activeSession === session.user_id ? '1.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="status-dot online pulse" />
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{session.user_name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4, paddingLeft: 16 }}>
                      {session.last_message}
                    </div>
                  </div>
                ))}
                {chatSessions.length === 0 && <div style={{ fontSize: 13, color: 'var(--outline)', textAlign: 'center', padding: 20 }}>No hay sesiones recientes.</div>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activeSession ? (
                <>
                  <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>supervisor_account</span>
                    <strong style={{ fontSize: 14, color: 'var(--primary)' }}>Intervención Manual</strong>
                    <span style={{ fontSize: 12, color: 'var(--secondary)' }}>— Controlando sesión del usuario</span>
                  </div>
                  <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface-container-lowest)' }}>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? 'var(--surface-container)' : (msg.role === 'admin' ? 'var(--secondary-container)' : 'var(--primary)'),
                        color: msg.role === 'user' ? 'var(--on-surface)' : (msg.role === 'admin' ? 'var(--primary)' : 'white'),
                        padding: '10px 16px', borderRadius: 12, maxWidth: '80%', fontSize: 14
                      }}>
                        {msg.role === 'admin' && <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ADMIN:</div>}
                        {msg.role === 'assistant' && <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, opacity: 0.7 }}>IA:</div>}
                        {msg.content}
                      </div>
                    ))}
                    {chatHistory.length === 0 && <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--outline)' }}>Sin mensajes previos.</div>}
                  </div>
                  <div style={{ padding: 16, borderTop: '1px solid var(--outline-variant)', background: 'white' }}>
                    <form onSubmit={sendAdminMessage} style={{ display: 'flex', gap: 12 }}>
                      <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)}
                        placeholder="Escribe como Administrador para intervenir..." className="input-field" />
                      <button type="submit" className="btn btn-primary" disabled={!adminMessage.trim()}>
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--outline)', gap: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>forum</span>
                  <span style={{ fontSize: 14 }}>Selecciona una sesión para intervenir</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
