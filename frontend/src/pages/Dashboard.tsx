import { useState, useEffect, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Project, Quote, PlanKey } from '../types';

const planLabels: Record<string, string> = { free: 'Discovery', habitacion: 'Habitación', depto: 'Departamento', casa: 'Casa', edificio: 'Edificio', provider: 'Proveedor' };
const statusLabels: Record<string, string> = { draft: 'Borrador', uploaded: 'Imagen Subida', generating: 'Generando...', completed: 'Completado', failed: 'Error' };
const statusColors: Record<string, string> = { draft: '#727975', uploaded: '#A68A7B', generating: '#4a645b', completed: '#2d6a4f', failed: '#ba1a1a' };

const planEntregables: Record<string, string> = {
  free: 'Render simple con marca de agua',
  habitacion: 'Lista de materiales + Presupuesto',
  depto: 'Plano de distribución 2D',
  casa: 'Plano Arquitectónico IA',
  edificio: 'Análisis de Viabilidad y Planos Pro',
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, q] = await Promise.all([api.getProjects(), api.getQuotes()]);
      setProjects(p);
      setQuotes(q);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Check for payment confirmation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const paymentStatus = params.get('payment');
    if (sessionId) {
      api.confirmPayment(sessionId).then((res) => {
        refreshUser();
        window.history.replaceState({}, '', '/dashboard');
        setToast(`¡Pago exitoso! +${res.tokens_added || ''} tokens agregados.`);
        setTimeout(() => setToast(''), 5000);
      }).catch(console.error);
    } else if (paymentStatus === 'success') {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const handleDeleteProject = async (e: MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) { console.error(err); }
  };

  const userPlan = (user?.plan || 'free') as PlanKey;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  if (loading) return <main style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></main>;

  return (
    <main className="page-animate" style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface-container-low)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Toast */}
        {toast && (
          <div className="toast toast-success">
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>check_circle</span>
            {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 40, color: 'var(--primary)', marginBottom: 8 }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ color: 'var(--secondary)', fontSize: 16 }}>Tu estudio de diseño inteligente y sostenible — Aguascalientes</p>
          </div>
          <button onClick={() => navigate('/studio')} className="btn btn-primary btn-lg">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nuevo Proyecto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { icon: 'token', label: 'Tokens', value: user?.tokens_balance ?? 0, color: 'var(--terracota)', bg: '#fef3ec' },
            { icon: 'folder', label: 'Proyectos', value: projects.length, color: 'var(--primary)', bg: 'var(--primary-fixed)' },
            { icon: 'request_quote', label: 'Cotizaciones', value: quotes.length, color: 'var(--secondary)', bg: 'var(--secondary-container)' },
            { icon: 'eco', label: 'CO₂ Evitado (kg)', value: Math.round(projects.reduce((acc, p) => acc + ((p.area || 0) * 3.5), 0)), color: '#2e7d32', bg: '#e8f5e9' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-fade-in-up">
              <div className="stat-icon" style={{ background: s.bg }}>
                <span className="material-symbols-outlined filled" style={{ color: s.color, fontSize: 22 }}>{s.icon}</span>
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Deliverable Info */}
        <div className="card" style={{ padding: 20, marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)', fontSize: 22 }}>workspace_premium</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--secondary)' }}>
                {planLabels[userPlan] || 'Discovery'} — Tu Plan Actual
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
                {planEntregables[userPlan] || 'Render simple con marca de agua'}
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: userPlan === 'free' ? 'var(--error)' : 'var(--success)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>{userPlan === 'free' ? 'lock' : 'check_circle'}</span>
                Proveedores: {userPlan === 'free' ? 'Bloqueado' : 'Acceso Total'}
              </div>
            </div>
          </div>
          {userPlan !== 'edificio' && (
            <button onClick={() => navigate('/plans')} className="btn btn-outline btn-sm">Mejorar Plan</button>
          )}
        </div>

        {/* Projects */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 28, color: 'var(--primary)', marginBottom: 20 }}>Mis Proyectos</h2>
          {projects.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', marginBottom: 16, display: 'block' }}>add_photo_alternate</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)', marginBottom: 8 }}>Aun no tienes proyectos</h3>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>Sube una foto de tu espacio y deja que la IA haga su magia</p>
              <button onClick={() => navigate('/studio')} className="btn btn-primary">Crear Primer Proyecto</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {projects.map(p => (
                <div key={p.id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/studio/${p.id}`)}>
                  <div style={{ height: 180, background: 'var(--surface-container)', overflow: 'hidden', position: 'relative' }}>
                    {p.generated_image ? (
                      <img src={p.generated_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : p.original_image ? (
                      <img src={p.original_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)' }}>image</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: statusColors[p.status] || '#727975', color: 'white', fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {statusLabels[p.status] || p.status}
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)', marginBottom: 4 }}>{p.name}</h3>
                      <button
                        onClick={(e) => handleDeleteProject(e, p.id)}
                        style={{ color: 'var(--outline)', fontSize: 18, padding: 4, borderRadius: 4, transition: 'color 0.2s' }}
                        title="Eliminar proyecto"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      <span>{p.style}</span>
                      <span>{p.area}m²</span>
                      <span>{p.width}x{p.length}x{p.height}m</span>
                    </div>
                    {p.materials && p.materials.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                        ${p.materials.reduce((sum, m) => sum + m.estimated_total_cost, 0).toLocaleString()} MXN estimado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quotes Section */}
        {quotes.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 28, color: 'var(--primary)', marginBottom: 20 }}>Mis Cotizaciones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {quotes.slice(0, 5).map(q => (
                <div key={q.id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>request_quote</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 14 }}>{q.provider_name || 'Proveedor'}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{q.project_name || 'Proyecto'} — {q.user_message?.slice(0, 60)}...</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {q.quoted_amount && (
                      <span style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)' }}>${q.quoted_amount.toLocaleString()}</span>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 10, fontFamily: 'var(--font-label)',
                      fontWeight: 700, textTransform: 'uppercase',
                      background: q.status === 'responded' ? 'var(--secondary-container)' : q.status === 'accepted' ? '#d4edda' : '#fff3cd',
                      color: q.status === 'responded' ? 'var(--primary)' : q.status === 'accepted' ? '#155724' : '#856404',
                    }}>{q.status === 'pending' ? 'Pendiente' : q.status === 'responded' ? 'Respondida' : q.status === 'accepted' ? 'Aceptada' : q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
          <Link to="/plans" className="card-interactive" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: 'var(--terracota)' }}>diamond</span>
            <div>
              <div style={{ fontFamily: 'var(--font-label)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Actualizar Plan</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>Más tokens y funcionalidades</div>
            </div>
          </Link>
          <Link to="/providers" className="card-interactive" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: 'var(--primary-container)' }}>storefront</span>
            <div>
              <div style={{ fontFamily: 'var(--font-label)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Directorio Proveedores</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>Encuentra artesanos verificados</div>
            </div>
          </Link>
        </div>

        {/* Environmental Impact Section */}
        {projects.length > 0 && (() => {
          const totalArea = projects.reduce((s, p) => s + (p.area || 0), 0);
          const co2Saved = Math.round(totalArea * 3.5);
          const waterSaved = Math.round(totalArea * 18);
          const treesEquiv = Math.round(co2Saved / 22);
          const energyReduced = Math.round(totalArea * 5.2);
          const wasteAvoided = Math.round(totalArea * 2.8);
          const localEconomy = Math.round(projects.reduce((s, p) => s + (p.materials?.reduce((ms, m) => ms + m.estimated_total_cost, 0) || 0), 0) * 0.6);

          return (
            <div className="card animate-fade-in-up" style={{ padding: 32, background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%)', border: '1px solid rgba(45,106,79,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 24, color: '#fff' }}>eco</span>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: '#1b5e20', marginBottom: 2 }}>Tu Impacto Ambiental</h2>
                  <p style={{ fontSize: 13, color: '#2e7d32' }}>Cada diseño con IA reduce desperdicio de materiales y optimiza recursos</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { icon: 'cloud_off', value: `${co2Saved} kg`, label: 'CO₂ Evitado', desc: 'Al planear antes de construir' },
                  { icon: 'water_drop', value: `${waterSaved} L`, label: 'Agua Ahorrada', desc: 'Menos desperdicios de obra' },
                  { icon: 'park', value: treesEquiv.toString(), label: 'Árboles Equivalentes', desc: 'Compensación de huella' },
                  { icon: 'bolt', value: `${energyReduced} kWh`, label: 'Energía Reducida', desc: 'Optimización de materiales' },
                  { icon: 'delete_sweep', value: `${wasteAvoided} kg`, label: 'Escombro Evitado', desc: 'Al diseñar con precisión' },
                  { icon: 'storefront', value: `$${localEconomy.toLocaleString()}`, label: 'Economía Local', desc: 'Invertido en proveedores locales' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: '#2d6a4f', display: 'block', marginBottom: 8 }}>{m.icon}</span>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: '#1b5e20', marginBottom: 2 }}>{m.value}</div>
                    <div style={{ fontFamily: 'var(--font-label)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2e7d32', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#4caf50', lineHeight: 1.3 }}>{m.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'rgba(27,94,32,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 20, color: '#2e7d32' }}>info</span>
                <p style={{ fontSize: 12, color: '#1b5e20', lineHeight: 1.5, flex: 1 }}>
                  <strong>¿Cómo calculamos esto?</strong> Cada m² diseñado con IA reduce un promedio de 3.5 kg de CO₂ al evitar compras innecesarias de materiales, viajes a tiendas y desperdicio de obra. Los datos se basan en estudios de eficiencia en construcción sustentable (CONAVI México).
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
