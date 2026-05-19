import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Project, Provider, GenerateResult, PlanDeliverable } from '../types';

const STYLES = ['Minimalista', 'Moderno', 'Hogareño Cálido', 'Escandinavo Orgánico', 'Brutalismo Suave', 'Plano 2D Básico', 'Plano Arquitectónico (Blueprint)'];

const PLAN_DELIVERABLES: Record<string, PlanDeliverable> = {
  free: { label: 'Discovery', entregable: 'Render simple con marca de agua', icon: 'image', showMaterials: false, showProviders: false, watermark: true },
  habitacion: { label: 'Habitación', entregable: 'Lista de materiales + Presupuesto', icon: 'receipt_long', showMaterials: true, showProviders: true, watermark: false },
  depto: { label: 'Departamento', entregable: 'Plano de distribución sugerido (2D básico)', icon: 'map', showMaterials: true, showProviders: true, watermark: false },
  casa: { label: 'Casa', entregable: 'Plano Arquitectónico IA (Muros, instalaciones)', icon: 'architecture', showMaterials: true, showProviders: true, watermark: false },
  edificio: { label: 'Edificio', entregable: 'Análisis de Viabilidad y Planos Técnicos Pro', icon: 'analytics', showMaterials: true, showProviders: true, watermark: false },
};

const LOADING_MSGS = [
  'Analizando dimensiones del espacio...',
  'Calculando volumetría y luz natural...',
  'Aplicando texturas del estilo seleccionado...',
  'Generando propuesta de materiales...',
  'Renderizando diseño final...',
];

type StudioStep = 'upload' | 'params' | 'generating' | 'result';

interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export default function AIStudio() {
  const { projectId } = useParams<{ projectId?: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [step, setStep] = useState<StudioStep>('upload');
  const [project, setProject] = useState<Project | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [style, setStyle] = useState('Minimalista');
  const [dims, setDims] = useState<Dimensions>({ width: 5, length: 5, height: 3 });
  const [name, setName] = useState('Mi Proyecto');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Load existing project
  useEffect(() => {
    if (projectId) {
      api.getProject(projectId).then(p => {
        setProject(p);
        setStyle(p.style);
        setDims({ width: p.width, length: p.length, height: p.height });
        setName(p.name);
        if (p.status === 'completed') {
          setResult({ project_id: p.id, status: p.status, generated_image: p.generated_image, materials: p.materials, estimated_total_cost: p.materials.reduce((s, m) => s + m.estimated_total_cost, 0) });
          setStep('result');
        } else if (p.original_image) {
          setPreview(p.original_image);
          setStep('params');
        }
      }).catch(() => navigate('/studio'));
    }
    api.getProviders().then(setProviders).catch(() => {});
  }, [projectId, navigate]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStep('params');
  };

  const handleGenerate = useCallback(async () => {
    setError('');
    if (!user || user.tokens_balance < 15) { setError('No tienes suficientes tokens. Necesitas 15 tokens para generar un render. Adquiere un plan o créditos adicionales.'); return; }

    setStep('generating');
    let msgIdx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    intervalRef.current = setInterval(() => { msgIdx = (msgIdx + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[msgIdx]); }, 2000);

    try {
      let pid = project?.id;
      if (!pid) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('style', style);
        formData.append('width', String(dims.width));
        formData.append('length', String(dims.length));
        formData.append('height', String(dims.height));
        if (selectedFile) formData.append('image', selectedFile);
        const newProject = await api.createProject(formData);
        pid = newProject.id;
        setProject(newProject);
      }

      const res = await api.generateDesign(pid);
      setResult(res);
      setStep('result');
      refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('params');
    } finally {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
  }, [user, project, name, style, dims, selectedFile, refreshUser]);

  const area = dims.width * dims.length;
  const pd = PLAN_DELIVERABLES[user?.plan || 'free'] || PLAN_DELIVERABLES.free;

  return (
    <main className="page page-surface-low">
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)', marginBottom: 8 }}>Estudio de Diseño IA</h1>
          <p style={{ color: 'var(--secondary)', fontSize: 16 }}>Sube una foto, elige un estilo y deja que la IA transforme tu espacio</p>
        </header>

        {error && <div className="alert-error" role="alert" style={{ marginBottom: 24 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>{error}</div>}

        <div className="studio-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
          {/* Main Area */}
          <div className="card" style={{ minHeight: 500, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {step === 'upload' && (
              <div onClick={() => fileRef.current?.click()} style={{ textAlign: 'center', cursor: 'pointer', padding: 60, width: '100%' }} className="animate-fade-in">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} aria-label="Subir imagen" />
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transition: 'transform 0.3s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>add_photo_alternate</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-label)', fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Haz clic para subir una foto</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>JPG, PNG, HEIC — Máximo 10MB</p>
              </div>
            )}

            {(step === 'params') && preview && (
              <div style={{ width: '100%', height: '100%', position: 'relative' }} className="animate-fade-in">
                <img src={preview} alt="Tu espacio" style={{ width: '100%', height: 500, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: 13, fontFamily: 'var(--font-label)' }}>Imagen cargada</span>
                  <button onClick={() => { setStep('upload'); setPreview(null); setSelectedFile(null); }} style={{ color: 'white', fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Cambiar</button>
                </div>
              </div>
            )}

            {step === 'generating' && (
              <div style={{ textAlign: 'center', padding: 60 }} className="animate-fade-in">
                <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 24px' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--outline-variant)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent' }} className="animate-spin" />
                  <span className="material-symbols-outlined animate-pulse" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--primary)' }}>psychology</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginBottom: 8 }}>Generando Diseño...</h3>
                <p style={{ color: 'var(--secondary)', fontSize: 14 }}>{loadingMsg}</p>
              </div>
            )}

            {step === 'result' && result && (
              <div style={{ width: '100%', height: '100%', position: 'relative' }} className="animate-fade-in">
                <img src={result.generated_image} alt="Diseño IA" style={{ width: '100%', height: 500, objectFit: 'cover' }} />
                {pd.watermark && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }}>
                    <div style={{ transform: 'rotate(-30deg)', fontSize: 48, fontFamily: 'var(--font-headline)', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>AMBAR STUDIO</div>
                  </div>
                )}
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white', fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span> Diseño Generado
                </div>
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    const a = document.createElement('a');
                    a.href = result.generated_image;
                    a.download = `AmbarStudio-${style.replace(/\s+/g, '-')}.jpg`;
                    a.click();
                  }} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} title="Descargar">
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>download</span>
                  </button>
                  <button onClick={() => {
                    const w = window.open('');
                    if (w) {
                      w.document.write(`<img src="${result.generated_image}" style="width:100%;max-width:1000px;display:block;margin:0 auto;" />`);
                      w.document.close();
                      w.focus();
                      setTimeout(() => w.print(), 500);
                    }
                  }} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} title="Imprimir Plano/Render">
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>print</span>
                  </button>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                  <h4 style={{ color: 'white', fontFamily: 'var(--font-headline)', fontSize: 24 }}>{style}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{area}m² área proyectada</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24, opacity: step === 'upload' ? 0.5 : 1, pointerEvents: step === 'upload' ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, color: 'var(--primary)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--outline-variant)' }}>Parámetros</h3>

              <div style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="project-name">Nombre</label>
                <input id="project-name" type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} style={{ padding: 10, fontSize: 13 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Medidas (metros)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {(['width', 'length', 'height'] as const).map(k => (
                    <input key={k} type="number" className="input-field" value={dims[k]} onChange={e => setDims({...dims, [k]: parseFloat(e.target.value) || 0})} min="1" style={{ textAlign: 'center', padding: 10, fontSize: 13 }} placeholder={k === 'width' ? 'Largo' : k === 'length' ? 'Ancho' : 'Alto'} aria-label={k === 'width' ? 'Largo' : k === 'length' ? 'Ancho' : 'Alto'} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 4, textAlign: 'right' }}>Área: {area}m²</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Estilo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)} style={{
                      padding: '10px 12px', textAlign: 'left', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                      background: style === s ? 'var(--primary)' : 'var(--surface-container)', color: style === s ? 'white' : 'var(--primary)',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {step !== 'result' && step !== 'generating' && (
                <button onClick={handleGenerate} className="btn btn-primary btn-block">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                  Generar Diseño (15 tokens)
                </button>
              )}
              {step === 'result' && (
                <button onClick={() => { setStep('params'); setResult(null); setProject(null); }} className="btn btn-outline btn-block">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> Nuevo Diseño
                </button>
              )}
            </div>

            {/* Plan Deliverable Info */}
            {step === 'result' && (
              <div className="card animate-fade-in-up" style={{ padding: 20, background: 'var(--secondary-container)', border: '1px solid rgba(23,48,40,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)', fontSize: 20 }}>{pd.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-label)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--secondary)' }}>Tu Plan: {pd.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{pd.entregable}</div>
                  </div>
                </div>
                {pd.watermark && (
                  <div style={{ fontSize: 12, color: 'var(--terracota)', marginTop: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                    Actualiza tu plan para quitar la marca de agua y ver materiales.
                    <Link to="/plans" style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: 4 }}>Ver planes →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Materials Result */}
            {step === 'result' && result?.materials && pd.showMaterials && (
              <div className="card animate-fade-in-up" style={{ padding: 24, background: 'var(--surface-container-lowest)', border: '1px solid rgba(23,48,40,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--outline-variant)' }}>
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)' }}>inventory_2</span>
                  <h3 style={{ fontFamily: 'var(--font-label)', fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Materiales Detectados</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.materials.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13, paddingBottom: 10, borderBottom: i < result.materials.length - 1 ? '1px solid var(--outline-variant)' : 'none', background: m.category === 'Sostenibilidad' ? '#e8f5e9' : 'transparent', padding: m.category === 'Sostenibilidad' ? '12px' : '0 0 10px 0', borderRadius: m.category === 'Sostenibilidad' ? '8px' : '0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: m.category === 'Sostenibilidad' ? '#2e7d32' : 'var(--primary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {m.category === 'Sostenibilidad' && <span className="material-symbols-outlined filled" style={{ fontSize: 16 }}>eco</span>}
                          {m.name}
                        </div>
                        {m.description && <div style={{ fontSize: 11, color: m.category === 'Sostenibilidad' ? '#1b5e20' : 'var(--on-surface-variant)', marginBottom: 4, lineHeight: 1.4 }}>{m.description}</div>}
                        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{m.category === 'Sostenibilidad' ? '' : `${m.estimated_quantity} ${m.unit}`}</div>
                      </div>
                      {m.category !== 'Sostenibilidad' && (
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-label)', fontSize: 13 }}>${m.estimated_total_cost.toFixed(0)}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>Total Estimado</span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)' }}>${result.estimated_total_cost.toLocaleString()} MXN</span>
                </div>

                {/* Providers */}
                {pd.showProviders && providers.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, color: 'var(--secondary)', marginBottom: 8, fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Proveedores Compatibles</p>
                    {providers.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>storefront</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{p.business_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--secondary)' }}>{p.categories?.join(', ')}</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--terracota)', fontWeight: 700 }}>{p.rating}</span>
                      </div>
                    ))}
                    <button onClick={() => navigate('/providers')} className="btn btn-outline btn-block btn-sm" style={{ marginTop: 12 }}>
                      Ver Todos los Proveedores
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Locked materials for free plan */}
            {step === 'result' && !pd.showMaterials && (
              <div className="card animate-fade-in-up" style={{ padding: 24, textAlign: 'center', background: 'var(--surface-container)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--outline)', marginBottom: 8, display: 'block' }}>lock</span>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: 18, color: 'var(--primary)', marginBottom: 8 }}>Materiales y Presupuesto</h4>
                <p style={{ fontSize: 13, color: 'var(--secondary)', marginBottom: 16 }}>Disponible desde el plan Habitación ($49 MXN)</p>
                <Link to="/plans" className="btn btn-primary btn-sm">Actualizar Plan</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
