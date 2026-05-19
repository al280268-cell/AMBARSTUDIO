import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Provider, Project, Product, PlanKey } from '../types';

// Plan capabilities — what each plan unlocks
const PLAN_ACCESS: Record<string, { providers: boolean; label: string; entregable: string }> = {
  free: { providers: false, label: 'Discovery (Gratis)', entregable: 'Render simple con marca de agua' },
  habitacion: { providers: true, label: 'Habitación', entregable: 'Lista de materiales + Presupuesto' },
  depto: { providers: true, label: 'Departamento', entregable: 'Plano de distribución sugerido (2D básico)' },
  casa: { providers: true, label: 'Casa', entregable: 'Plano Arquitectónico IA (Muros, instalaciones)' },
  edificio: { providers: true, label: 'Edificio', entregable: 'Análisis de Viabilidad y Planos Técnicos Pro' },
  provider: { providers: true, label: 'Proveedor', entregable: 'Panel de proveedor' },
};

export default function Providers() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [quoteModal, setQuoteModal] = useState<Provider | null>(null);
  const [quoteMsg, setQuoteMsg] = useState('');
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalogModal, setCatalogModal] = useState<Provider | null>(null);
  const [providerProducts, setProviderProducts] = useState<Product[]>([]);

  const hasProviderAccess = user && PLAN_ACCESS[user.plan]?.providers;

  useEffect(() => {
    if (hasProviderAccess) {
      api.getProviders().then(setProviders).catch(console.error).finally(() => setLoading(false));
      api.getProjects().then(setProjects).catch(() => {});
    } else {
      setLoading(false);
    }
  }, [user, hasProviderAccess]);

  const allCategories = [...new Set(providers.flatMap(p => p.categories || []))].sort();

  const filtered = providers.filter(p => {
    const matchSearch = !search || p.business_name.toLowerCase().includes(search.toLowerCase()) || p.categories?.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !activeCategory || p.categories?.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  const handleSendQuote = async () => {
    if (!quoteModal || !quoteMsg.trim()) return;
    if (!user) { window.location.href = '/login'; return; }
    if (projects.length === 0) {
      setQuoteSuccess('Necesitas crear un proyecto primero. Ve al Estudio de Diseño IA.');
      setTimeout(() => { setQuoteSuccess(''); setQuoteModal(null); }, 3000);
      return;
    }
    setQuoteSending(true);
    try {
      await api.createQuote({ project_id: projects[0].id, provider_id: quoteModal.id, message: quoteMsg });
      setQuoteSuccess(`¡Cotización enviada a ${quoteModal.business_name}! Te responderán pronto.`);
      setQuoteMsg('');
      setTimeout(() => { setQuoteSuccess(''); setQuoteModal(null); }, 3000);
    } catch (err) {
      setQuoteSuccess('Error: ' + (err instanceof Error ? err.message : 'No se pudo enviar'));
      setTimeout(() => setQuoteSuccess(''), 4000);
    }
    setQuoteSending(false);
  };

  // ─── PAYWALL: User not logged in or on free plan ───
  if (!user || !hasProviderAccess) {
    return (
      <main style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="card animate-fade-in-up" style={{ padding: '60px 40px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline)' }}>lock</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)', marginBottom: 12 }}>
              Directorio de Proveedores
            </h1>
            <p style={{ color: 'var(--secondary)', fontSize: 16, marginBottom: 8 }}>
              Acceso exclusivo para planes de paga
            </p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, lineHeight: 1.7, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              El directorio de proveedores verificados de Aguascalientes está disponible a partir del plan <strong>Habitación ($49 MXN)</strong>. 
              Conecta directamente con artesanos, solicita cotizaciones y accede a precios exclusivos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32, textAlign: 'left' }}>
              {[
                { plan: 'Discovery', price: 'Gratis', access: 'Bloqueado', icon: 'block', color: 'var(--outline)' },
                { plan: 'Habitación', price: '$49', access: 'Acceso Total', icon: 'check_circle', color: 'var(--success)' },
                { plan: 'Depto', price: '$99', access: 'Acceso Total', icon: 'check_circle', color: 'var(--success)' },
                { plan: 'Casa', price: '$149', access: 'Acceso Total', icon: 'check_circle', color: 'var(--success)' },
                { plan: 'Edificio', price: '$199', access: 'Acceso Total', icon: 'check_circle', color: 'var(--success)' },
              ].map((p, i) => (
                <div key={i} style={{ padding: 16, background: i === 0 ? 'var(--surface-container)' : 'var(--secondary-container)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: p.color }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{p.plan} — {p.price}</div>
                    <div style={{ fontSize: 11, color: i === 0 ? 'var(--error)' : 'var(--success)' }}>{p.access}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/plans" className="btn btn-primary btn-lg">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>diamond</span>
                Ver Planes
              </Link>
              {!user && (
                <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
              )}
            </div>
          </div>

          {/* Preview of what they'll get */}
          <div style={{ marginTop: 32, opacity: 0.5 }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)', marginBottom: 16 }}>Vista previa del directorio</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, filter: 'blur(6px)', pointerEvents: 'none' }}>
              {['Maderas del Centro AGS', 'Ilumina Studio AGS', 'Textil Natura AGS'].map((name, i) => (
                <div key={i} className="card" style={{ padding: 20, height: 200 }}>
                  <div style={{ height: 100, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'var(--secondary)' }}>Aguascalientes · ★ 4.8</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loading) return <main style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></main>;

  // ─── FULL ACCESS: Paid plan users ───
  return (
    <main style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--outline-variant)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 40, color: 'var(--primary)', marginBottom: 8 }}>Directorio de Proveedores</h1>
            <p style={{ color: 'var(--secondary)', fontSize: 16 }}>Artesanos y profesionales verificados en Aguascalientes</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="input-field" placeholder="Buscar por material o nombre..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280, padding: '10px 16px', fontSize: 13 }} />
          </div>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCategory('')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', background: !activeCategory ? 'var(--primary)' : 'var(--surface-container)', color: !activeCategory ? 'white' : 'var(--secondary)', border: 'none' }}>Todos</button>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', background: activeCategory === cat ? 'var(--primary)' : 'var(--surface-container)', color: activeCategory === cat ? 'white' : 'var(--secondary)', border: 'none' }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: 'var(--surface-container)' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)' }}>storefront</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.categories?.slice(0, 2).map((c, i) => (
                    <span key={i} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-full)', fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>{c}</span>
                  ))}
                </div>
                {p.verified && (
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                  </div>
                )}
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)' }}>{p.business_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 16, color: 'var(--terracota)' }}>star</span>
                    <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{p.rating}</span>
                    <span style={{ fontSize: 11, color: 'var(--secondary)' }}>({p.review_count})</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{p.bio}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {p.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>{p.city}</span>}
                  {p.coverage && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>local_shipping</span>{p.coverage === 'national' ? 'Nacional' : 'Local'}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-outline" style={{ flex: 1, fontSize: 10 }} onClick={() => {
                    setCatalogModal(p);
                    setProviderProducts([]);
                    api.getProviderProducts(p.id).then(setProviderProducts).catch(console.error);
                  }}>Catálogo</button>
                  <button className="btn btn-sm btn-primary" style={{ flex: 1, fontSize: 10 }} onClick={() => { setQuoteModal(p); setQuoteMsg(''); setQuoteSuccess(''); }}>Cotizar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', marginBottom: 16, display: 'block' }}>search_off</span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)', marginBottom: 8 }}>No se encontraron proveedores</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {quoteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) setQuoteModal(null); }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 32, background: 'var(--surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)' }}>Solicitar Cotización</h3>
              <button onClick={() => setQuoteModal(null)} style={{ color: 'var(--secondary)', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>storefront</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{quoteModal.business_name}</div>
                <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{quoteModal.categories?.join(', ')}</div>
              </div>
            </div>
            {quoteSuccess ? (
              <div style={{ padding: 20, textAlign: 'center', background: quoteSuccess.startsWith('Error') || quoteSuccess.startsWith('Necesitas') ? '#fde8e8' : 'var(--secondary-container)', borderRadius: 'var(--radius-md)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: quoteSuccess.startsWith('Error') || quoteSuccess.startsWith('Necesitas') ? 'var(--error)' : 'var(--success)', display: 'block', marginBottom: 8 }}>{quoteSuccess.startsWith('Error') || quoteSuccess.startsWith('Necesitas') ? 'error' : 'check_circle'}</span>
                <p style={{ fontSize: 14, color: 'var(--primary)' }}>{quoteSuccess}</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Mensaje para el proveedor</label>
                  <textarea className="input-field" value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)} placeholder="Describe lo que necesitas: materiales, cantidades, dimensiones del espacio..." rows={4} style={{ resize: 'vertical', minHeight: 100 }} />
                </div>
                <button onClick={handleSendQuote} disabled={quoteSending || !quoteMsg.trim()} className="btn btn-primary btn-block">
                  {quoteSending ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                      Enviar Cotización
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Catalog Modal */}
      {catalogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) setCatalogModal(null); }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-container-lowest)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)' }}>Catálogo de Productos</h3>
                <div style={{ fontSize: 13, color: 'var(--secondary)' }}>{catalogModal.business_name}</div>
              </div>
              <button onClick={() => setCatalogModal(null)} style={{ color: 'var(--secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: 32, overflowY: 'auto', flex: 1 }}>
              {providerProducts.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '40px 0' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>inventory_2</span>
                  <p>Este proveedor aún no ha agregado productos a su catálogo.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {providerProducts.map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      {p.image_url ? (
                        <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-container)' }}>
                          <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--outline-variant)' }}>inventory_2</span>
                        </div>
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--secondary)', marginBottom: 6 }}>{p.category}</div>
                        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--terracota)', fontSize: 18 }}>${p.price.toLocaleString()} MXN</span>
                          <span style={{ fontSize: 11, color: 'var(--secondary)' }}>por {p.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
