import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.resetPassword({ token, password });
      setMessage(res.detail);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-centered">
      <div className="auth-card animate-fade-in-up">
        <div className="auth-header">
          <h1 className="auth-title">Restablecer Contraseña</h1>
          <p className="auth-subtitle">Ingresa tu nueva contraseña</p>
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

          <div className="form-group">
            <label className="input-label" htmlFor="reset-token">Token de Recuperación</label>
            <input 
              id="reset-token" 
              type="text" 
              className="input-field" 
              placeholder="Pega el token aquí..." 
              value={token} 
              onChange={e => setToken(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="reset-password">Nueva Contraseña</label>
            <input 
              id="reset-password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="reset-confirm-password">Confirmar Contraseña</label>
            <input 
              id="reset-confirm-password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              minLength={8}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Restablecer Contraseña'}
          </button>

          <div className="auth-switch" style={{ marginTop: 16 }}>
            <Link to="/login" className="auth-link">Volver a Iniciar Sesión</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
