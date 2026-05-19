import { useEffect } from 'react';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page" style={{ paddingTop: 120 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'var(--surface-container-lowest)', padding: '48px 64px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 36, color: 'var(--primary)', marginBottom: 24, borderBottom: '2px solid var(--primary-fixed)', paddingBottom: 16 }}>
          Términos, Condiciones y Políticas de Ámbar Studio
        </h1>
        
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
          <p style={{ marginBottom: 24 }}>
            Bienvenido a Ámbar Studio. Al utilizar nuestra plataforma, aceptas los términos que rigen nuestra relación para asegurar que tus proyectos de construcción se ejecuten con precisión y respaldo tecnológico, bajo el marco legal vigente en México.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>1. Condiciones de Uso del Servicio</h2>
          
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Naturaleza del Servicio</h3>
          <p style={{ marginBottom: 16 }}>Ámbar Studio proporciona herramientas de Inteligencia Artificial para el cálculo de materiales, estimación de presupuestos y enlace comercial con proveedores y especialistas.</p>
          <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li style={{ marginBottom: 8 }}><strong>Precisión de Datos y Validación Técnica:</strong> Los cálculos generados por nuestra IA se basan en la información proporcionada por el usuario. Ámbar Studio entrega estimaciones orientativas. Es responsabilidad obligatoria del cliente validar las medidas y especificaciones con un arquitecto o ingeniero responsable de obra antes de realizar compras finales o iniciar la construcción.</li>
            <li style={{ marginBottom: 8 }}><strong>Enlace con Terceros:</strong> Actuamos como facilitadores entre el cliente y proveedores/especialistas. Los contratos de compra de materiales o servicios de mano de obra se rigen bajo los términos individuales de cada proveedor. Ámbar Studio no se hace responsable por vicios ocultos, retrasos o incumplimientos por parte de los proveedores contactados.</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Responsabilidades del Usuario</h3>
          <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li>Proporcionar datos veraces, exactos y actualizados.</li>
            <li>Hacer un uso ético de la plataforma, respetando los derechos de propiedad intelectual.</li>
            <li>Contar con la capacidad legal para contratar servicios según las leyes mexicanas.</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Propiedad Intelectual</h3>
          <p style={{ marginBottom: 24 }}>
            Todo el software, algoritmos, marcas y reportes generados son propiedad exclusiva de Ámbar Studio. Se concede al usuario una licencia de uso personal o profesional para el proyecto consultado, prohibiendo estrictamente la reventa, ingeniería inversa o reproducción total o parcial del software.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>2. Políticas de Devolución y Reembolso</h2>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Suscripciones y Servicios Digitales</h3>
          <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li style={{ marginBottom: 8 }}><strong>Cálculos y Presupuestos IA:</strong> Debido a la naturaleza de entrega inmediata y consumo digital de los reportes, no se realizan reembolsos una vez que el cálculo ha sido generado.</li>
            <li style={{ marginBottom: 8 }}><strong>Garantía de Satisfacción:</strong> Si el resultado presenta errores técnicos comprobables atribuibles directamente a nuestros algoritmos, realizaremos la corrección sin costo o emitiremos un crédito para futuros cálculos.</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Servicios de Gestión (Contacto con Proveedores)</h3>
          <p style={{ marginBottom: 24 }}>
            Si se ha pagado una comisión por gestión de contacto y esta no se concreta por causas imputables a Ámbar Studio (ej. inexistencia del proveedor o falta de cobertura no advertida), se reembolsará el 100% de dicha comisión a través del mismo método de pago original.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 24, marginBottom: 8 }}>Cancelaciones</h3>
          <p style={{ marginBottom: 24 }}>
            Puedes cancelar tu suscripción en cualquier momento. La cancelación surtirá efecto al finalizar el periodo de facturación actual, manteniendo el acceso a las herramientas hasta dicha fecha.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>3. Jurisdicción y Protección al Consumidor</h2>
          <p style={{ marginBottom: 24 }}>
            Para la interpretación y cumplimiento de estos términos, las partes se someten a las leyes federales de México y a la jurisdicción de los tribunales competentes en la Ciudad de Aguascalientes, México, así como a la competencia administrativa de la Procuraduría Federal del Consumidor (PROFECO).
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>4. Política de Gestión de Tokens y Créditos</h2>
          <p style={{ marginBottom: 16 }}><strong>Naturaleza de los Créditos:</strong> El usuario adquiere una bolsa de tokens según el plan contratado. Estos créditos representan el poder de procesamiento de la IA para realizar acciones como renders, planos técnicos o escaneos.</p>
          <p style={{ marginBottom: 8 }}><strong>Consumo por Acción:</strong> Cada acción dentro de la app descuenta tokens:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
            <li>Generación de Render HD: 15 tokens.</li>
            <li>Generación de Plano Técnico (2D/3D): 25 tokens.</li>
            <li>Ajuste de Estilo o Color: 5 tokens.</li>
          </ul>
          <p style={{ marginBottom: 24 }}>
            <strong>Garantía de Reintento:</strong> Si el sistema no logra procesar una imagen debido a fallos técnicos o mala calidad de origen, los tokens no serán descontados o serán reintegrados automáticamente tras la validación.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>5. Limitación por Superficie (m²)</h2>
          <p style={{ marginBottom: 16 }}>
            <strong>Validación de Metraje:</strong> La plataforma utiliza visión artificial para estimar las dimensiones del espacio. El uso de las herramientas está limitado al metraje máximo del plan adquirido.
          </p>
          <p style={{ marginBottom: 24 }}>
            <strong>Detección de Excedentes:</strong> En caso de que el área procesada supere el límite del plan, el chatbot notificará al usuario para realizar un Upgrade Dinámico.
          </p>

          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, color: 'var(--primary)', marginTop: 40, marginBottom: 16 }}>6. Propiedad y Alcance de los Entregables</h2>
          <p style={{ marginBottom: 16 }}>
            <strong>Planos Técnicos:</strong> Los planos generados por la IA son de carácter orientativo y conceptual. No sustituyen un plano arquitectónico oficial firmado por un perito y no deben usarse para trámites legales sin supervisión humana.
          </p>
          <p style={{ marginBottom: 24 }}>
            <strong>Acceso a Proveedores:</strong> El enlace directo y contacto con proveedores es un beneficio activo a partir de cualquier plan de pago. En el plan gratuito, esta información permanecerá bloqueada para proteger la integridad del modelo de negocio.
          </p>

        </div>
      </div>
    </main>
  );
}
