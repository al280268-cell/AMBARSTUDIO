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
            <a href="#" className="footer-col-link">
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: 'middle' }}>mail</span>
              hola@ambar.studio
            </a>
            <a href="#" className="footer-col-link">
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: 'middle' }}>tag</span>
              @ambarstudio
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-note">&copy; {new Date().getFullYear()} AMBAR STUDIO. Diseño Consciente. Aguascalientes, México.</div>
          <div className="footer-note">Hecho con IA + Pasión</div>
        </div>
      </div>
    </footer>
  );
}
