import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDemoToken('');
    setLoading(true);
    
    try {
      const res = await api.recoverPassword(email);
      setMessage(res.detail);
      if (res.demo_token) {
        setDemoToken(res.demo_token);
      }
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
          <h1 className="auth-title">Recuperar Contraseña</h1>
          <p className="auth-subtitle">Ingresa tu correo para recibir un enlace de recuperación</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert-error" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          {message && (
            <div className="alert-success" role="alert" style={{ background: 'var(--success-container)', color: 'var(--on-success-container)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {message}
            </div>
          )}

          {demoToken && (
            <div style={{ background: 'var(--surface-container-highest)', padding: 16, borderRadius: 8, marginBottom: 16, textAlign: 'left', wordBreak: 'break-all' }}>
              <strong style={{ fontSize: 12, color: 'var(--primary)', display: 'block', marginBottom: 8 }}>MODO DEMO: Copia este token para restablecer tu contraseña:</strong>
              <code style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{demoToken}</code>
              <Link to={`/reset-password?token=${demoToken}`} className="btn btn-primary btn-sm btn-block" style={{ marginTop: 12 }}>
                Ir a restablecer contraseña
              </Link>
            </div>
          )}

          <div className="form-group">
            <label className="input-label" htmlFor="recover-email">Correo Electrónico</label>
            <input 
              id="recover-email" 
              type="email" 
              className="input-field" 
              placeholder="tu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Enviar Enlace'}
          </button>

          <div className="auth-switch" style={{ marginTop: 16 }}>
            <Link to="/login" className="auth-link">Volver a Iniciar Sesión</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
