import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-text">AMBAR STUDIO</div>
            <p className="footer-desc">
              Plataforma de diseño interior con inteligencia artificial. Transforma tu espacio, calcula materiales y conecta con proveedores verificados en Aguascalientes.
            </p>
            {/* Real Social Links */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/as.ambarstudio/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram @as.ambarstudio"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1EPv5GGnAf/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook AMBAR STUDIO"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#1877F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@ambarstudio.as"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok @ambarstudio.as"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#010101',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Plataforma</div>
            <Link to="/" className="footer-col-link">Inicio</Link>
            <Link to="/plans" className="footer-col-link">Planes y Precios</Link>
            <Link to="/providers" className="footer-col-link">Proveedores</Link>
            <Link to="/studio" className="footer-col-link">Estudio IA</Link>
          </div>

          <div>
            <div className="footer-col-title">Recursos</div>
            <Link to="/plans" className="footer-col-link">Tokens y Créditos</Link>
            <Link to="/providers" className="footer-col-link">Directorio AGS</Link>
            <Link to="/terms" className="footer-col-link">Políticas de Uso</Link>
            <Link to="/privacy" className="footer-col-link">Aviso de Privacidad</Link>
          </div>

          <div>
            <div className="footer-col-title">Contacto</div>
            <a href="#" className="footer-col-link">
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: 'middle' }}>location_on</span>
              Aguascalientes, MX
            </a>
            <a href="mailto:hola@ambar.studio" className="footer-col-link">
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: 'middle' }}>mail</span>
              hola@ambar.studio
            </a>
            <a href="https://www.instagram.com/as.ambarstudio/" target="_blank" rel="noopener noreferrer" className="footer-col-link">
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: 'middle' }}>tag</span>
              @as.ambarstudio
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-note">&copy; {new Date().getFullYear()} AMBAR STUDIO. Diseño Consciente. Aguascalientes, México.</div>
          <div className="footer-note">Hecho con IA + Pasión 🌿</div>
        </div>
      </div>
    </footer>
  );
}
