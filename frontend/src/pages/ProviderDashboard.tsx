import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Provider, Quote, Review, Product, ProviderProfilePayload } from '../types';

const COMMISSION_RATES: Record<string, string> = { habitacion: '3%', depto: '2.5%', casa: '2%', edificio: '1.5%' };

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Provider | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProviderProfilePayload>>({});
  const [respondModal, setRespondModal] = useState<Quote | null>(null);
  const [productModal, setProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', unit: 'unidad', category: '' });
  const [responseText, setResponseText] = useState('');
  const [responseAmount, setResponseAmount] = useState('');
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providerRes, quotesRes] = await Promise.all([
        api.getProviders().catch(() => []),
        api.getQuotes().catch(() => []),
      ]);
      const myProfile = providerRes.find(p => p.user_id === user?.id);
      setProfile(myProfile ?? null);
      setQuotes(quotesRes);
      if (myProfile) {
        setEditForm({ business_name: myProfile.business_name, bio: myProfile.bio, whatsapp: myProfile.whatsapp, instagram: myProfile.instagram, contact_email: myProfile.contact_email, city: myProfile.city || 'Aguascalientes', categories: myProfile.categories || [] });
        api.getProviderReviews(myProfile.id).then(setReviews).catch(() => {});
        api.getProviderProducts(myProfile.id).then(setProducts).catch(() => {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    try {
      await api.createProviderProfile({
        business_name: String(editForm.business_name || ''),
        bio: String(editForm.bio || ''),
        categories: editForm.categories || [],
        whatsapp: String(editForm.whatsapp || ''),
        instagram: String(editForm.instagram || ''),
        contact_email: String(editForm.contact_email || ''),
        coverage: String(editForm.coverage || 'local'),
        city: String(editForm.city || ''),
      });
      setEditMode(false);
      showToast('Perfil actualizado correctamente');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const handleRespond = async (quoteId: number) => {
    try {
      await api.respondQuote(quoteId, { provider_response: responseText, quoted_amount: parseFloat(responseAmount) || null, status: 'responded' });
      setRespondModal(null);
      setResponseText('');
      setResponseAmount('');
      showToast('Respuesta enviada al cliente');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const handleAddProduct = async () => {
    try {
      await api.createProduct({ ...newProduct, price: parseFloat(newProduct.price) });
      setProductModal(false);
      setNewProduct({ name: '', description: '', price: '', unit: 'unidad', category: '' });
      showToast('Producto agregado al catálogo');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const handleUploadProfileImage = async (file: File) => {
    setUploading('profile');
    try {
      await api.uploadProviderImage(file);
      showToast('Imagen de empresa actualizada');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
    setUploading(null);
  };

  const handleUploadProductImage = async (productId: number, file: File) => {
    setUploading(`product-${productId}`);
    try {
      await api.uploadProductImage(productId, file);
      showToast('Imagen de producto actualizada');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
    setUploading(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Eliminar este producto del catálogo?')) return;
    try {
      await api.deleteProduct(productId);
      showToast('Producto eliminado');
      loadData();
    } catch (e) { showToast('Error: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const statusLabels: Record<string, string> = { pending: 'Pendiente', responded: 'Respondida', accepted: 'Aceptada', rejected: 'Rechazada' };
  const statusColors: Record<string, string> = { pending: 'var(--terracota)', responded: 'var(--primary)', accepted: 'var(--success)', rejected: 'var(--error)' };

  if (loading) return <main style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></main>;

  return (
    <main style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {toast && <div className="toast toast-success"><span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 8 }}>check_circle</span>{toast}</div>}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: 'var(--primary)' }}>storefront</span>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)' }}>Portal de Proveedor</h1>
            </div>
            <p style={{ color: 'var(--secondary)', fontSize: 15 }}>Gestiona tu perfil, cotizaciones y conecta con clientes en Aguascalientes</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: 'request_quote', label: 'Cotizaciones', value: quotes.length, color: 'var(--terracota)' },
            { icon: 'pending', label: 'Pendientes', value: quotes.filter(q => q.status === 'pending').length, color: 'var(--terracota)' },
            { icon: 'star', label: 'Rating', value: profile?.rating?.toFixed(1) || '—', color: 'var(--primary)' },
            { icon: 'reviews', label: 'Reseñas', value: profile?.review_count || 0, color: 'var(--secondary)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined filled" style={{ color: s.color, fontSize: 20 }}>{s.icon}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Left: Quotes */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginBottom: 16 }}>Cotizaciones Recibidas</h2>
            {quotes.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)', display: 'block', marginBottom: 12 }}>inbox</span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)', marginBottom: 8 }}>Sin cotizaciones aún</h3>
                <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Los clientes te encontrarán en el directorio y enviarán solicitudes aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {quotes.map(q => (
                  <div key={q.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{q.project_name || 'Proyecto'}</div>
                        <div style={{ fontSize: 12, color: 'var(--secondary)' }}>Recibida: {new Date(q.created_at).toLocaleDateString('es-MX')}</div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', background: `${statusColors[q.status]}15`, color: statusColors[q.status] }}>
                        {statusLabels[q.status]}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 12, padding: 12, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Cliente:</strong> {q.user_message || 'Sin mensaje'}
                    </p>
                    {q.provider_response && (
                      <p style={{ fontSize: 13, color: 'var(--primary)', padding: 12, background: 'var(--secondary-container)', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
                        <strong>Tu respuesta:</strong> {q.provider_response}
                        {q.quoted_amount && <span style={{ display: 'block', fontFamily: 'var(--font-headline)', fontSize: 18, marginTop: 4 }}>${q.quoted_amount.toLocaleString()} MXN</span>}
                      </p>
                    )}
                    {q.status === 'pending' && (
                      <button onClick={() => { setRespondModal(q); setResponseText(''); setResponseAmount(''); }} className="btn btn-primary btn-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>reply</span>Responder
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Profile + Commission Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Profile Card */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)' }}>Mi Perfil</h3>
                <button onClick={() => setEditMode(!editMode)} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{editMode ? 'close' : 'edit'}</span>
                  {editMode ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {profile && !editMode ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {profile.image_url ? <img src={profile.image_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--outline-variant)' }} /> :
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>storefront</span>
                        </div>
                      }
                      <label style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', border: '2px solid var(--surface)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff' }}>{uploading === 'profile' ? 'hourglass_top' : 'photo_camera'}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadProfileImage(f); e.target.value = ''; }} disabled={uploading === 'profile'} />
                      </label>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>{profile.business_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{profile.city} · {profile.categories?.join(', ')}</div>
                      {profile.verified && <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>✓ Verificado</span>}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 12 }}>{profile.bio}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--secondary)' }}>
                    {profile.whatsapp && <div><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }}>call</span>{profile.whatsapp}</div>}
                    {profile.instagram && <div><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }}>photo_camera</span>{profile.instagram}</div>}
                    {profile.contact_email && <div><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }}>mail</span>{profile.contact_email}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label className="input-label">Nombre del Negocio</label><input className="input-field" value={String(editForm.business_name || '')} onChange={e => setEditForm({...editForm, business_name: e.target.value})} /></div>
                  <div><label className="input-label">Categorías (separadas por coma)</label><input className="input-field" value={(editForm.categories || []).join(', ')} onChange={e => setEditForm({...editForm, categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="Ej: Carpintería, Muebles" /></div>
                  <div><label className="input-label">Bio / Descripción</label><textarea className="input-field" rows={3} value={String(editForm.bio || '')} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ resize: 'vertical' }} /></div>
                  <div><label className="input-label">Ciudad</label><input className="input-field" value={String(editForm.city || '')} onChange={e => setEditForm({...editForm, city: e.target.value})} /></div>
                  <div><label className="input-label">WhatsApp</label><input className="input-field" value={String(editForm.whatsapp || '')} onChange={e => setEditForm({...editForm, whatsapp: e.target.value})} placeholder="wa.me/521234567890" /></div>
                  <div><label className="input-label">Instagram</label><input className="input-field" value={String(editForm.instagram || '')} onChange={e => setEditForm({...editForm, instagram: e.target.value})} placeholder="@tunegocio" /></div>
                  <div><label className="input-label">Email de Contacto</label><input className="input-field" value={String(editForm.contact_email || '')} onChange={e => setEditForm({...editForm, contact_email: e.target.value})} /></div>
                  <button onClick={handleSaveProfile} className="btn btn-primary btn-block btn-sm">Guardar Perfil</button>
                </div>
              )}
            </div>

            {/* Product Catalog */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)' }}>Mi Catálogo</h3>
                <button onClick={() => setProductModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: 10, padding: '4px 10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Agregar
                </button>
              </div>
              {products.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--secondary)', textAlign: 'center', padding: '20px 0' }}>No tienes productos en tu catálogo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {products.map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--outline-variant)' }}>
                      {/* Product thumbnail with upload */}
                      <label style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--outline-variant)', position: 'relative' }}>
                        {p.image_url && p.image_url.startsWith('/uploads/') ? (
                          <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>{uploading === `product-${p.id}` ? 'hourglass_top' : 'add_photo_alternate'}</span>
                        )}
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadProductImage(p.id, f); e.target.value = ''; }} disabled={uploading === `product-${p.id}`} />
                      </label>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--secondary)' }}>{p.category} · ${p.price.toLocaleString()} MXN/{p.unit}</div>
                      </div>
                      <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-ghost btn-sm" style={{ padding: 4, minWidth: 'auto', color: 'var(--error)' }} title="Eliminar producto">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>            {/* Commission Info */}
            <div className="card" style={{ padding: 20, background: 'var(--secondary-container)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 18, color: 'var(--primary)' }}>percent</span>
                <h4 style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comisiones por Proyecto</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(COMMISSION_RATES).map(([plan, rate]) => (
                  <div key={plan} style={{ padding: 10, background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)' }}>{rate}</div>
                    <div style={{ fontSize: 10, color: 'var(--secondary)', textTransform: 'capitalize' }}>{plan}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 10, lineHeight: 1.5 }}>
                La comisión se aplica solo cuando el cliente acepta y se concreta el proyecto a través de AMBAR STUDIO.
              </p>
            </div>

            {/* What We Offer */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Lo que te ofrecemos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: 'visibility', text: 'Visibilidad en el directorio de Aguascalientes' },
                  { icon: 'people', text: 'Clientes pre-calificados con proyectos reales' },
                  { icon: 'verified', text: 'Sello de proveedor verificado' },
                  { icon: 'request_quote', text: 'Sistema de cotizaciones directo' },
                  { icon: 'bar_chart', text: 'Estadísticas de tu perfil y reseñas' },
                  { icon: 'support_agent', text: 'Soporte dedicado para proveedores' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--success)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Reseñas Recientes</h4>
                {reviews.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < 2 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                      {[...Array(5)].map((_, s) => (
                        <span key={s} className="material-symbols-outlined filled" style={{ fontSize: 12, color: s < r.rating ? 'var(--terracota)' : 'var(--outline-variant)' }}>star</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Respond Modal */}
      {respondModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) setRespondModal(null); }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 32, background: 'var(--surface-container-lowest)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)', marginBottom: 16 }}>Responder Cotización</h3>
            <div style={{ padding: 12, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
              <strong>Proyecto:</strong> {respondModal.project_name}<br/>
              <strong>Cliente dice:</strong> {respondModal.user_message}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Tu Respuesta</label>
              <textarea className="input-field" rows={3} value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Describe tu propuesta, tiempos de entrega, etc." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Monto Cotizado (MXN) — opcional</label>
              <input className="input-field" type="number" value={responseAmount} onChange={e => setResponseAmount(e.target.value)} placeholder="Ej: 15000" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setRespondModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={() => handleRespond(respondModal.id)} disabled={!responseText.trim()} className="btn btn-primary" style={{ flex: 1 }}>Enviar Respuesta</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {productModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) setProductModal(false); }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 32, background: 'var(--surface-container-lowest)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)', marginBottom: 16 }}>Agregar Producto</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Nombre del Producto</label>
              <input className="input-field" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej: Piso Porcelanato 60x60" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Categoría</label>
              <input className="input-field" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Ej: Suelos" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Descripción</label>
              <textarea className="input-field" rows={2} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label className="input-label">Precio (MXN)</label>
                <input className="input-field" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Ej: 350" />
              </div>
              <div>
                <label className="input-label">Unidad de medida</label>
                <select className="input-field" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                  <option value="unidad">Unidad / Pieza</option>
                  <option value="m²">m²</option>
                  <option value="litros">Litros</option>
                  <option value="metros lineales">Metros lineales</option>
                  <option value="caja">Caja</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setProductModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleAddProduct} disabled={!newProduct.name || !newProduct.price} className="btn btn-primary" style={{ flex: 1 }}>Guardar Producto</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
