import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-centered">
      <div className="auth-card animate-fade-in-up">
        <div className="auth-header">
          <h1 className="auth-title">Bienvenido</h1>
          <p className="auth-subtitle">Continúa diseñando tu entorno con precisión orgánica</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert-error" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="input-label" htmlFor="login-email">Correo Electrónico</label>
            <input id="login-email" type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Iniciar Sesión'}
          </button>

          <div className="auth-switch">
            <span>¿No tienes cuenta? </span>
            <Link to="/register" className="auth-link">Regístrate</Link>
          </div>
        </form>

        <div className="demo-hint">
          <p className="demo-hint-label">Cuenta Demo</p>
          <p className="demo-hint-value">demo@ambar.studio / demo123</p>
        </div>
      </div>
    </main>
  );
}
