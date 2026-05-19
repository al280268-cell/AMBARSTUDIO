import { useEffect } from 'react';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page" style={{ paddingTop: 120 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'var(--surface-container-lowest)', padding: '48px 64px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)', marginBottom: 24, borderBottom: '2px solid var(--primary-fixed)', paddingBottom: 16 }}>
          Aviso de Privacidad
        </h1>
        
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
          <p style={{ marginBottom: 24 }}>
            Ámbar Studio (en lo sucesivo "La Empresa"), con domicilio en [UAA SUR], es el responsable del tratamiento de sus datos personales, del uso que se les dé a los mismos y de su protección, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>1. Datos Personales que Recabamos</h2>
          <p style={{ marginBottom: 16 }}>Para llevar a cabo las finalidades descritas en el presente aviso, recabaremos las siguientes categorías de datos:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li style={{ marginBottom: 8 }}><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, teléfono de contacto y dirección de envío o ubicación de la obra.</li>
            <li style={{ marginBottom: 8 }}><strong>Datos Técnicos y de Proyecto:</strong> Planos, medidas, especificaciones de materiales, fotografías de la construcción y presupuestos estimados.</li>
            <li style={{ marginBottom: 8 }}><strong>Datos Patrimoniales o Financieros:</strong> Información de tarjetas de crédito/débito o cuentas bancarias para el procesamiento de pagos (gestionados a través de procesadores de pago seguros).</li>
            <li style={{ marginBottom: 8 }}><strong>Datos de Navegación:</strong> Dirección IP, tipo de dispositivo, cookies y datos de uso de la plataforma para mejorar la experiencia de usuario.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>2. Finalidades del Tratamiento</h2>
          <p style={{ marginBottom: 16 }}>Sus datos personales serán utilizados para las siguientes finalidades primarias (necesarias para el servicio):</p>
          <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li style={{ marginBottom: 8 }}>Prestación de los servicios de cálculo de construcción mediante Inteligencia Artificial.</li>
            <li style={{ marginBottom: 8 }}>Generación de reportes de presupuestos y listas de materiales.</li>
            <li style={{ marginBottom: 8 }}>Gestión de enlace y contacto directo con proveedores de materiales y especialistas en construcción.</li>
            <li style={{ marginBottom: 8 }}>Procesamiento de pagos y facturación.</li>
            <li style={{ marginBottom: 8 }}>Atención a clientes y soporte técnico.</li>
            <li style={{ marginBottom: 8 }}><strong>Validación de Identidad y Ubicación:</strong> Para el funcionamiento del Matchmaking Geolocalizado, se recolectarán datos de ubicación en tiempo real para conectar al usuario con el stock disponible de proveedores locales.</li>
            <li style={{ marginBottom: 8 }}><strong>Análisis de Imágenes por Chatbot:</strong> Las imágenes cargadas son analizadas por el asistente inteligente para mejorar la precisión de los cálculos de materiales y evitar desperdicios, alineado con el compromiso de sostenibilidad de la marca.</li>
          </ol>
          
          <p style={{ marginBottom: 8 }}>De manera secundaria, utilizaremos su información para:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>Envío de promociones, boletines y ofertas relacionadas con la industria de la construcción.</li>
            <li>Mejora de nuestros algoritmos de IA mediante el análisis de datos anonimizados.</li>
            <li>Encuestas de calidad y satisfacción.</li>
          </ul>
          <p style={{ marginBottom: 24 }}>
            Si no desea que sus datos se utilicen para estas finalidades secundarias, puede enviar un correo a [Correo de Soporte] manifestando su negativa.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>3. Transferencia de Datos Personales</h2>
          <p style={{ marginBottom: 16 }}>Para cumplir con el servicio, Ámbar Studio podrá transferir sus datos a:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li style={{ marginBottom: 8 }}><strong>Proveedores y Especialistas:</strong> Compartiremos sus datos de contacto y necesidades de obra únicamente con aquellos terceros que usted seleccione para cotizar o contratar.</li>
            <li style={{ marginBottom: 8 }}><strong>Autoridades:</strong> En caso de requerimiento legal o para la protección de derechos de La Empresa.</li>
            <li style={{ marginBottom: 8 }}><strong>Sociedades del mismo grupo:</strong> Para fines de administración interna y análisis de datos.</li>
          </ul>
          <p style={{ marginBottom: 24 }}>Al aceptar este aviso, usted consiente expresamente la transferencia de sus datos a los proveedores necesarios para la ejecución de sus presupuestos.</p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>4. Derechos ARCO</h2>
          <p style={{ marginBottom: 16 }}>
            Usted tiene derecho a conocer qué datos tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación), que la eliminemos de nuestros registros (Cancelación) o a oponerse al uso de sus datos para fines específicos (Oposición).
          </p>
          <p style={{ marginBottom: 8 }}>Para ejercer sus Derechos ARCO, deberá presentar una solicitud por escrito al correo electrónico: [Correo de Privacidad], detallando:</p>
          <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li>Nombre del titular y medio para comunicar la respuesta.</li>
            <li>Documentos que acrediten su identidad.</li>
            <li>Descripción clara de los datos sobre los que busca ejercer el derecho.</li>
          </ol>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>5. Uso de Cookies y Tecnologías de Rastreo</h2>
          <p style={{ marginBottom: 24 }}>
            Nuestra plataforma utiliza cookies para mejorar su experiencia. Usted puede deshabilitar el uso de cookies desde la configuración de su navegador; sin embargo, esto podría afectar el funcionamiento de algunas herramientas de cálculo de la plataforma.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>6. Medidas de Seguridad</h2>
          <p style={{ marginBottom: 24 }}>
            Ámbar Studio ha adoptado medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado, incluyendo el uso de certificados SSL para la transmisión de datos.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>7. Cambios al Aviso de Privacidad</h2>
          <p style={{ marginBottom: 24 }}>
            Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad, para la atención de novedades legislativas o políticas internas.
          </p>
        </div>
      </div>
    </main>
  );
}
