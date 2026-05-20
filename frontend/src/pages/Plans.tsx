import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { PlanKey } from '../types';
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = (publishableKey: string) => {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const PLANS = [
  {
    key: 'discovery', name: 'Discovery', price: 0, tokens: 15, icon: 'explore',
    maxArea: '12 m²', free: true,
    entregable: 'Render simple con marca de agua',
    providerAccess: 'Bloqueado',
    features: ['15 tokens incluidos', 'Renders con marca de agua', 'Hasta 12m²', 'Acceso limitado'],
  },
  {
    key: 'habitacion', name: 'Habitación', price: 49, tokens: 120, icon: 'weekend',
    maxArea: '25 m²',
    entregable: 'Lista de materiales + Presupuesto',
    providerAccess: 'Acceso Total a Proveedores',
    features: ['120 tokens', 'Lista de materiales', 'Presupuesto detallado', 'Acceso a proveedores', 'Hasta 25m²'],
  },
  {
    key: 'depto', name: 'Departamento', price: 99, tokens: 250, icon: 'apartment',
    maxArea: '90 m²', popular: true,
    entregable: 'Plano de distribución sugerido (2D básico)',
    providerAccess: 'Acceso Total a Proveedores',
    features: ['250 tokens', 'Todo de Habitación', 'Plano 2D básico', 'Cotizaciones directas', 'Hasta 90m²'],
  },
  {
    key: 'casa', name: 'Casa', price: 149, tokens: 500, icon: 'house',
    maxArea: '250 m²',
    entregable: 'Plano Arquitectónico IA (Muros, instalaciones)',
    providerAccess: 'Acceso Total a Proveedores',
    features: ['500 tokens', 'Todo de Departamento', 'Plano arquitectónico IA', 'Muros e instalaciones', 'Hasta 250m²'],
  },
  {
    key: 'edificio', name: 'Edificio', price: 199, tokens: null, icon: 'location_city',
    maxArea: 'Sin límite', tokensLabel: 'Ilimitados',
    entregable: 'Análisis de Viabilidad y Planos Técnicos Pro',
    providerAccess: 'Acceso Total a Proveedores',
    features: ['Tokens ilimitados', 'Todo de Casa', 'Análisis de viabilidad', 'Planos técnicos pro', 'Sin límite de área'],
  },
];

const TOKEN_COSTS = [
  { action: 'Generar Render HD', cost: 15, why: 'Es el proceso que más exige al servidor.' },
  { action: 'Generar Plano (2D/3D)', cost: 25, why: 'Requiere análisis de medidas y visión artificial.' },
  { action: 'Cambio de material/color', cost: 5, why: 'Modificación leve sobre un diseño existente.' },
  { action: 'Escaneo de Espacio', cost: 5, why: 'Reconocimiento inicial de la habitación.' },
  { action: 'Descarga de Reporte PDF', cost: 10, why: 'Compilación de toda la data técnica y enlaces.' },
];

export default function Plans() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [stripeConfig, setStripeConfig] = useState<{publishable_key: string; stripe_enabled: boolean} | null>(null);

  useEffect(() => {
    api.getPaymentConfig().then(config => {
      setStripeConfig(config);
      if (config.stripe_enabled && config.publishable_key) {
        getStripe(config.publishable_key);
      }
    }).catch(console.error);
  }, []);

  // Handle payment success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'cancelled') {
       window.history.replaceState({}, '', '/plans');
       alert('Pago cancelado. No se hizo ningún cargo.');
    }
    
    if (sessionId && user) {
      api.confirmPayment(sessionId).then((res) => {
        refreshUser();
        window.history.replaceState({}, '', '/plans');
        setToast(`¡Pago confirmado! Se agregaron ${res.tokens_added || ''} tokens a tu cuenta.`);
        setTimeout(() => setToast(''), 5000);
      }).catch((err: unknown) => {
        console.error(err);
        window.history.replaceState({}, '', '/plans');
        alert(err instanceof Error ? err.message : 'Error al verificar el pago');
      });
    }
  }, [user]);

  const handleBuy = async (planKey: string) => {
    if (planKey === 'discovery') return; // Free tier
    if (!user) { window.location.href = '/register'; return; }
    setLoading(planKey);
    try {
      const res = await api.createCheckout({
        plan: planKey,
        success_url: window.location.origin + '/plans?payment=success',
        cancel_url: window.location.origin + '/plans?payment=cancelled',
      });

      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar el pago');
    }
    setLoading(null);
  };

  return (
    <main style={{ paddingTop: 96, minHeight: '100vh', padding: '96px 32px 80px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 44, color: 'var(--primary)', marginBottom: 12 }}>Planes y Precios</h1>
        <p style={{ color: 'var(--secondary)', fontSize: 16, maxWidth: 600, margin: '0 auto 48px' }}>
          Elige el plan que mejor se adapte a tu proyecto. Todos los planes de paga incluyen acceso total a proveedores en Aguascalientes.
        </p>

        {(!stripeConfig?.stripe_enabled) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 152, 0, 0.1)',
            marginBottom: 24, fontSize: 12, fontFamily: 'var(--font-label)',
            color: 'var(--warning, #ff9800)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--warning, #ff9800)',
              display: 'inline-block',
            }} />
            Modo demostración (Stripe Inactivo)
          </div>
        )}

        {toast && (
          <div className="toast toast-success" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>check_circle</span>
            {toast}
          </div>
        )}

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 48 }}>
          {PLANS.map(plan => (
            <div key={plan.key} className="card" style={{
              padding: 28, display: 'flex', flexDirection: 'column', position: 'relative',
              border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
              transform: plan.popular ? 'scale(1.03)' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Más Popular
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: plan.free ? 'var(--outline)' : 'var(--primary)', marginBottom: 8, display: 'block' }}>{plan.icon}</span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, color: 'var(--primary)', marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--secondary)' }}>Hasta {plan.maxArea}</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                {plan.free ? (
                  <span style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--success)' }}>Gratis</span>
                ) : (
                  <>
                    <span style={{ fontFamily: 'var(--font-headline)', fontSize: 40, color: 'var(--primary)' }}>${plan.price}</span>
                    <span style={{ fontSize: 14, color: 'var(--secondary)' }}> MXN</span>
                  </>
                )}
              </div>

              <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 16, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {plan.tokensLabel || `${plan.tokens} tokens`}
                </div>
              </div>

              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 20, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: plan.free && i > 1 ? 'var(--outline)' : 'var(--success)' }}>
                      {plan.free && i > 1 ? 'remove' : 'check_circle'}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: 10, color: 'var(--secondary)', marginBottom: 12, padding: '8px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                <strong>Entregable:</strong> {plan.entregable}
              </div>

              <button
                onClick={() => handleBuy(plan.key)}
                disabled={loading === plan.key || plan.free || user?.plan === plan.key}
                className={`btn btn-block ${plan.popular ? 'btn-primary' : plan.free ? 'btn-ghost' : 'btn-outline'}`}
                style={user?.plan === plan.key ? { opacity: 0.6 } : plan.free ? { cursor: 'default', opacity: 0.7 } : {}}
              >
                {loading === plan.key ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> :
                  user?.plan === plan.key ? '✓ Plan Actual' :
                  plan.free ? 'Incluido al registrarse' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>

        {/* Token Cost Table */}
        <div className="card" style={{ padding: 32, textAlign: 'left', marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginBottom: 4 }}>
            ¿En qué se gastan los tokens?
          </h3>
          <p style={{ color: 'var(--secondary)', fontSize: 13, marginBottom: 20 }}>Lógica de consumo de tokens por acción</p>
          <table className="token-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Costo</th>
                <th>¿Por qué se cobra?</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_COSTS.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.action}</td>
                  <td>
                    <span style={{ background: 'var(--secondary-container)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                      {t.cost} tokens
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{t.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Provider Commission Info */}
        <div className="card" style={{ padding: 24, textAlign: 'left', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 24, color: 'var(--terracota)' }}>storefront</span>
            <div>
              <h4 style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>Comisiones a Proveedores</h4>
              <p style={{ fontSize: 12, color: 'var(--secondary)' }}>Esquema competitivo y equitativo según escala del proyecto</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Habitación / Estudio', rate: '3%' },
              { label: 'Departamento', rate: '2.5%' },
              { label: 'Casa', rate: '2%' },
              { label: 'Edificio', rate: '1.5%' },
            ].map((c, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginBottom: 4 }}>{c.rate}</div>
                <div style={{ fontSize: 11, color: 'var(--secondary)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Refill Token Pack */}
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: 'var(--terracota)' }}>token</span>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>Recarga de 100 Créditos</h4>
              <p style={{ fontSize: 12, color: 'var(--secondary)' }}>Para usuarios que requieren más interacciones de diseño — $29 MXN</p>
            </div>
          </div>
          <button onClick={() => handleBuy('tokens_100')} className="btn btn-terracota btn-sm">Comprar Créditos</button>
        </div>
      </div>
    </main>
  );
}
