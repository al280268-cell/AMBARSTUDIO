import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

interface Stat {
  value: string;
  label: string;
}

export default function Landing() {
  const { user } = useAuth();

  const features: Feature[] = [
    { icon: 'add_a_photo', title: 'Sube tu Espacio', desc: 'Fotografía cualquier habitación en JPG o PNG desde tu celular' },
    { icon: 'auto_awesome', title: 'IA Genera Diseño', desc: 'Nuestra IA transforma tu espacio con el estilo que prefieras' },
    { icon: 'inventory_2', title: 'Materiales y Costos', desc: 'Cálculo automático de materiales, cantidades y presupuesto' },
    { icon: 'storefront', title: 'Proveedores Locales', desc: 'Conecta con artesanos verificados en Aguascalientes' },
  ];

  const testimonials: Testimonial[] = [
    { name: 'María G.', role: 'Propietaria', text: 'Transformé mi sala en 2 minutos. Los materiales calculados coincidieron al 95% con lo que compré.', rating: 5 },
    { name: 'Roberto L.', role: 'Arquitecto', text: 'Uso AMBAR para presentar propuestas rápidas a mis clientes. Les encanta ver el render antes de invertir.', rating: 5 },
    { name: 'Ana Sofía M.', role: 'Interiorista', text: 'El directorio de proveedores de Aguascalientes me ha conectado con artesanos que no conocía.', rating: 4 },
  ];

  const stats: Stat[] = [
    { value: '500+', label: 'Espacios Transformados' },
    { value: '5', label: 'Estilos de Diseño' },
    { value: '6+', label: 'Proveedores Verificados' },
    { value: '15', label: 'Tokens Gratis al Registrarse' },
  ];

  return (
    <main className="page gradient-bg-animated" style={{ padding: 0 }}>
      {/* Hero */}
      <section className="hero-grid" style={{ paddingTop: 104, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'var(--primary-fixed)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.6, zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40vw', height: '40vw', background: 'var(--secondary-container)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5, zIndex: 0 }} />

        <div className="hero-content animate-fade-in-up glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '80px 64px', zIndex: 1 }}>
          <div style={{ maxWidth: 560 }}>
            <div className="animate-float" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-md)', marginBottom: 24, border: '1px solid var(--outline-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>location_on</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-label)', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aguascalientes, MX</span>
            </div>
            <h1 className="section-title" style={{ marginBottom: 20, fontSize: 'clamp(40px, 5vw, 56px)', letterSpacing: '-0.02em' }}>
              Inspiración que se convierte en realidad
            </h1>
            <p className="section-subtitle" style={{ marginBottom: 40, maxWidth: 520, fontSize: 18 }}>
              Imagina. Crea. Transforma. Diseño inteligente impulsado por IA para revolucionar los espacios de tu hogar.
            </p>
            <Link to={user ? '/studio' : '/register'} className="btn btn-primary btn-lg glow-primary" style={{ marginBottom: 40, borderRadius: 999 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>auto_awesome</span>
              {user ? 'Ir al Estudio' : 'Iniciar Transformación Mágica'}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85 }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3].map((i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--surface-container-lowest)', background: i === 1 ? 'var(--secondary)' : i === 2 ? 'var(--primary)' : 'var(--terracota)', marginLeft: i > 1 ? -12 : 0, boxShadow: 'var(--shadow-sm)' }} />
                ))}
              </div>
              <span className="badge badge-soft" style={{ background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-sm)' }}>+500 espacios transformados</span>
            </div>
          </div>
        </div>
        <div className="hero-image-col animate-fade-in" style={{ zIndex: 1 }}>
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80" alt="Diseño Interior Aguascalientes" style={{ transform: 'scale(1.05)', transition: 'transform 10s ease-in-out' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
          <div className="hero-panel glass-panel animate-float-delayed" style={{ bottom: 32, right: 32, border: '1px solid rgba(255,255,255,0.6)' }}>
            <p className="hero-panel-title">Proyecto Atrio</p>
            <p className="hero-panel-text">Un enfoque orgánico que prioriza la luz natural y materiales sustentables de la región.</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="hero-tag" style={{ background: 'var(--primary)', color: 'white' }}>Sustentable</span>
              <span className="hero-tag" style={{ background: 'rgba(255,255,255,0.8)', color: 'var(--primary)' }}>Minimalista</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 32px', background: 'var(--primary)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {stats.map((s, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: 'var(--secondary)', marginBottom: 8, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '120px 32px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: 'var(--primary)', marginBottom: 16 }}>La Magia Detrás</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 18, marginBottom: 80, maxWidth: 600, margin: '0 auto 80px' }}>Cuatro pasos para transformar tu espacio con inteligencia artificial avanzada.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }} className="stagger">
            {features.map((f, i) => (
              <div key={i} className="card glass-panel animate-fade-in-up" style={{ padding: 40, textAlign: 'center', borderTop: '4px solid var(--secondary)' }}>
                <div className="animate-float" style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--surface-container-lowest), var(--primary-fixed))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-md)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>{f.icon}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--terracota)', marginBottom: 12 }}>Paso {i + 1}</div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Pricing Preview */}
      <section style={{ padding: '100px 32px', background: 'var(--surface-container-low)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: 'var(--primary)', marginBottom: 16 }}>Precios Accesibles</h2>
          <p style={{ color: 'var(--secondary)', fontSize: 16, marginBottom: 60, fontWeight: 500 }}>Desde $0 para explorar hasta $199 MXN para proyectos a gran escala</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {[
              { name: 'Discovery', price: 'Gratis', tokens: '15 tokens', pop: false },
              { name: 'Habitación', price: '$49', tokens: '120 tokens', pop: false },
              { name: 'Depto', price: '$99', tokens: '250 tokens', pop: true },
              { name: 'Casa', price: '$149', tokens: '500 tokens', pop: false },
              { name: 'Edificio', price: '$199', tokens: 'Ilimitados', pop: false },
            ].map((p, i) => (
              <div key={i} className={`card ${p.pop ? 'glow-primary' : ''}`} style={{ padding: '32px 24px', textAlign: 'center', transform: p.pop ? 'scale(1.05)' : 'none', border: p.pop ? '2px solid var(--secondary)' : '', zIndex: p.pop ? 2 : 1 }}>
                {p.pop && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--secondary)', color: 'white', fontSize: 10, fontWeight: 'bold', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Popular</div>}
                <div style={{ fontSize: 13, fontFamily: 'var(--font-label)', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)', marginBottom: 8 }}>{p.price}</div>
                <div style={{ fontSize: 13, color: 'var(--terracota)', fontWeight: 700 }}>{p.tokens}</div>
              </div>
            ))}
          </div>
          <Link to="/plans" className="btn btn-outline btn-lg" style={{ marginTop: 60, borderRadius: 999 }}>Explorar Planes Detallados</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '120px 32px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: 'var(--primary)', marginBottom: 60 }}>Experiencias Reales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card glass-panel animate-fade-in-up" style={{ padding: 40, textAlign: 'left', animationDelay: `${i * 0.15}s` }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="material-symbols-outlined filled" style={{ fontSize: 20, color: s < t.rating ? 'var(--secondary)' : 'var(--outline-variant)' }}>star</span>
                  ))}
                </div>
                <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, color: 'var(--primary)', fontSize: 18 }}>{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section style={{ padding: '120px 32px', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 40%, #fff8e1 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '40vw', height: '40vw', background: 'rgba(45,106,79,0.08)', filter: 'blur(100px)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 999, background: '#2d6a4f', color: 'white', fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, boxShadow: '0 4px 16px rgba(45,106,79,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>eco</span>
              Compromiso con el planeta
            </div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: '#1b5e20', marginBottom: 16 }}>Diseñar con propósito</h2>
            <p style={{ color: '#2e7d32', fontSize: 18, maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
              Cada proyecto diseñado con IA evita desperdicios, reduce emisiones y fortalece la economía local de Aguascalientes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
            {[
              { icon: 'cloud_off', value: '3.5 kg/m²', title: 'CO₂ Evitado por Proyecto', desc: 'Al visualizar antes de comprar, reduces viajes innecesarios a tiendas y devoluciones de materiales que generan emisiones.' },
              { icon: 'water_drop', value: '18 L/m²', title: 'Agua Ahorrada', desc: 'La planificación precisa evita desperdicios de mezclas, pintura y materiales húmedos que consumen agua durante la construcción.' },
              { icon: 'delete_sweep', value: '2.8 kg/m²', title: 'Escombro Prevenido', desc: 'El cálculo exacto de materiales evita sobrantes que terminan en vertederos, reduciendo la contaminación del suelo.' },
              { icon: 'bolt', value: '40%', title: 'Menos Energía', desc: 'Los estilos sustentables priorizan iluminación natural y materiales de bajo impacto energético en su producción.' },
              { icon: 'storefront', value: '60%', title: 'Economía Local', desc: 'Conectamos con artesanos y proveedores de Aguascalientes, fortaleciendo cadenas productivas regionales y reduciendo transporte.' },
              { icon: 'park', value: '22 kg CO₂', title: '= 1 Árbol por Año', desc: 'Un árbol absorbe ~22 kg de CO₂ al año. Con cada proyecto grande, tu ahorro equivale a plantar árboles.' },
            ].map((item, i) => (
              <div key={i} className="card glass-panel animate-fade-in-up" style={{ padding: 32, animationDelay: `${i * 0.1}s`, borderLeft: '4px solid #2d6a4f' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 26, color: 'white' }}>{item.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: '#1b5e20' }}>{item.value}</div>
                    <div style={{ fontFamily: 'var(--font-label)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2e7d32' }}>{item.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#37474f', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', padding: 32, borderRadius: 'var(--radius-xl)', background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.15)' }}>
            <p style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: '#1b5e20', marginBottom: 8 }}>
              "La construcción genera el 39% de las emisiones globales de CO₂"
            </p>
            <p style={{ fontSize: 14, color: '#2e7d32', maxWidth: 600, margin: '0 auto' }}>
              — Fuente: UNEP Global Status Report. En AMBAR STUDIO creemos que diseñar inteligentemente es el primer paso para construir responsablemente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="organic-gradient" style={{ padding: '100px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, white 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 48, color: 'white', marginBottom: 24, textShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>Transforma tu espacio hoy</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>Obtén 15 tokens gratuitos al registrarte hoy. No requieres tarjeta de crédito para empezar a crear la casa de tus sueños.</p>
          <Link to="/register" className="btn btn-lg glow-primary" style={{ background: 'white', color: 'var(--primary)', borderRadius: 999, fontSize: 15, padding: '20px 40px' }}>
            Comenzar Gratis Ahora
          </Link>
        </div>
      </section>
    </main>
  );
}
