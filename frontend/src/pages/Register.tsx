import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: string;
  city: string;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', role: 'user', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const u = (key: keyof RegisterForm, val: string) => setForm({ ...form, [key]: val });

  return (
    <main className="page-centered">
      <div className="auth-card auth-card-wide animate-fade-in-up">
        <div className="auth-header">
          <h1 className="auth-title" style={{ fontSize: 36 }}>Crea tu Cuenta</h1>
          <p className="auth-subtitle">3 renders gratuitos al registrarte</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: 18 }}>
          {error && <div className="alert-error" role="alert"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>{error}</div>}

          {/* Role selector */}
          <div className="form-group">
            <label className="input-label">Tipo de Cuenta</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ val: 'user', icon: 'person', label: 'Usuario' }, { val: 'provider', icon: 'storefront', label: 'Proveedor' }].map(r => (
                <button key={r.val} type="button" onClick={() => u('role', r.val)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${form.role === r.val ? 'var(--primary)' : 'var(--outline-variant)'}`,
                  background: form.role === r.val ? 'var(--secondary-container)' : 'transparent', transition: 'all 0.3s', cursor: 'pointer'
                }}>
                  <span className="material-symbols-outlined" style={{ color: form.role === r.val ? 'var(--primary)' : 'var(--secondary)', fontSize: 24 }}>{r.icon}</span>
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 600, color: form.role === r.val ? 'var(--primary)' : 'var(--secondary)' }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="reg-name">Nombre Completo</label>
            <input id="reg-name" type="text" className="input-field" placeholder="Tu nombre" value={form.name} onChange={e => u('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="reg-email">Correo Electrónico</label>
            <input id="reg-email" type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e => u('email', e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="reg-city">Ciudad</label>
            <input id="reg-city" type="text" className="input-field" placeholder="Tu ciudad" value={form.city} onChange={e => u('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="reg-password">Contraseña</label>
            <input id="reg-password" type="password" className="input-field" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => u('password', e.target.value)} required autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Crear Cuenta'}
          </button>

          <div className="auth-switch">
            <span>¿Ya tienes cuenta? </span>
            <Link to="/login" className="auth-link">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
