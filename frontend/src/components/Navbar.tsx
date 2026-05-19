import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NavLink {
  path: string;
  label: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string): boolean => location.pathname === path;

  const navLinks: NavLink[] = !user ? [
    { path: '/', label: 'Inicio' },
    { path: '/plans', label: 'Planes' },
    { path: '/providers', label: 'Proveedores' }
  ] : user.role === 'provider' ? [] : user.role === 'admin' ? [] : [
    { path: '/providers', label: 'Directorio de Proveedores' }
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-brand">AMBAR STUDIO</Link>

          <div className="nav-links-desktop">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={`nav-link ${isActive(link.path) ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                {user.role === 'user' && (
                  <Link to="/studio" className="btn btn-sm btn-primary nav-hide-mobile" style={{ fontSize: 11 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                    Estudio IA
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-sm btn-ghost nav-hide-mobile" style={{ fontSize: 11 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                  Dashboard
                </Link>
                {user.role === 'user' && (
                  <div className="nav-token">
                    <span className="material-symbols-outlined filled" style={{ fontSize: 14, color: 'var(--terracota)' }}>token</span>
                    {user.tokens_balance}
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <div className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)} title="Menú" role="button" aria-label="Menú">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {dropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 8, minWidth: 160, zIndex: 100 }} className="animate-fade-in-up">
                      <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--primary)', fontWeight: 600, borderBottom: '1px solid var(--outline-variant)', marginBottom: 4 }}>
                        {user.name}
                        <div style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 400 }}>{user.email}</div>
                      </div>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 12px', fontSize: 13, color: 'var(--on-surface)', textDecoration: 'none', borderRadius: 'var(--radius-xs)' }}>Dashboard</Link>
                      <button onClick={logout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-xs)', marginTop: 4 }}>Cerrar Sesión</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="nav-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link to="/login" className="nav-link" style={{ fontFamily: 'var(--font-label)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">Empezar</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-mobile-toggle" aria-label="Menú">
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu animate-fade-in-up" onClick={e => e.stopPropagation()}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="mobile-menu-link" style={{
                color: isActive(link.path) ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontWeight: isActive(link.path) ? 700 : 400,
              }}>
                {link.label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '8px 0' }} />
            {user ? (
              <>
                <Link to="/dashboard" className="mobile-menu-link">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>dashboard</span>
                  {user.role === 'provider' ? 'Portal de Proveedor' : 'Mi Estudio'}
                </Link>
                {user.role === 'user' && (
                  <>
                    <Link to="/studio" className="mobile-menu-link">
                      <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>auto_awesome</span>
                      Nuevo Proyecto
                    </Link>
                    <div className="mobile-menu-link" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)' }}>
                      <span className="material-symbols-outlined filled" style={{ fontSize: 16, color: 'var(--terracota)' }}>token</span>
                      {user.tokens_balance} tokens disponibles
                    </div>
                  </>
                )}
                <button onClick={logout} className="mobile-menu-link" style={{ width: '100%', textAlign: 'left', color: 'var(--error)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>logout</span>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-menu-link">Iniciar Sesión</Link>
                <Link to="/register" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>Empezar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
