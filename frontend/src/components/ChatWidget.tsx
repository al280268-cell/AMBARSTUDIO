import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import api from '../services/api';
import type { ChatMessage } from '../types';

interface LocalResponse {
  keywords: string[];
  reply: string;
}

// Local fallback responses when backend is unavailable
const LOCAL_RESPONSES: LocalResponse[] = [
  { keywords: ["hola", "buenas", "hey", "saludos", "hi"], reply: "¡Hola! 👋 Soy tu asistente de diseño en AMBAR STUDIO. ¿En qué puedo ayudarte?" },
  { keywords: ["precio", "costo", "cuanto", "plan"], reply: "¡Claro! Tenemos 5 planes:\n\n🆓 Discovery: Gratis — 15 tokens\n🏠 Habitación: $49 MXN — 120 tokens\n🏢 Depto: $99 MXN — 250 tokens\n🏡 Casa: $149 MXN — 500 tokens\n🏗️ Edificio: $199 MXN — Ilimitados\n\n💡 Recarga: $29 MXN por 100 créditos adicionales." },
  { keywords: ["material", "madera", "piso", "cemento"], reply: "Trabajamos con materiales premium: microcemento, roble, porcelanato, vidrio templado, textiles naturales, cerámica artesanal y más. Todos disponibles con proveedores verificados de Aguascalientes." },
  { keywords: ["estilo", "minimalista", "moderno", "diseño"], reply: "Tenemos 5 estilos de diseño:\n\n✨ Minimalista\n🔲 Moderno\n🏡 Hogareño Cálido\n🌿 Escandinavo Orgánico\n🧱 Brutalismo Suave\n\nCada estilo genera una paleta de materiales diferente." },
  { keywords: ["como funciona", "ayuda", "pasos", "tutorial"], reply: "¡Es muy fácil!\n\n1️⃣ Sube una foto de tu espacio\n2️⃣ Configura dimensiones (largo, ancho, alto)\n3️⃣ Elige un estilo de diseño\n4️⃣ La IA genera tu render + lista de materiales\n5️⃣ Conecta con proveedores de Aguascalientes\n\n⚡ Un render cuesta 15 tokens." },
  { keywords: ["token", "credito", "gasta", "consume"], reply: "Lógica de consumo de tokens:\n\n🎨 Render HD: 15 tokens\n📐 Plano 2D/3D: 25 tokens\n🎨 Cambio material: 5 tokens\n📷 Escaneo espacio: 5 tokens\n📄 Reporte PDF: 10 tokens\n\n💡 Recarga: $29 MXN = 100 créditos" },
  { keywords: ["proveedor", "artesano", "directorio"], reply: "Tenemos 6+ proveedores verificados en Aguascalientes:\n\n🪵 Maderas del Centro AGS\n💡 Ilumina Studio AGS\n🧵 Textil Natura AGS\n🏺 Cerámica Aguascalientes\n⚒️ Herrería Artística AGS\n🎨 ColorHogar Pinturas\n\nAcceso disponible desde el plan Habitación ($49)." },
  { keywords: ["aguascalientes", "ubicacion", "donde"], reply: "AMBAR STUDIO opera en Aguascalientes, México. Todos nuestros proveedores son locales y verificados. 📍" },
  { keywords: ["comision", "porcentaje"], reply: "Las comisiones a proveedores son:\n\n🏠 Habitación: 3%\n🏢 Departamento: 2.5%\n🏡 Casa: 2%\n🏗️ Edificio: 1.5%\n\nEsquema competitivo y equitativo según escala del proyecto." },
  { keywords: ["gracias", "genial", "perfecto", "ok"], reply: "¡De nada! 😊 Estoy aquí para ayudarte con cualquier duda sobre diseño, materiales, planes o proveedores. ¡Pregunta lo que necesites!" },
  { keywords: ["registro", "cuenta", "registrar"], reply: "Puedes crear tu cuenta gratis en la página de registro. Recibirás 15 tokens para probar la plataforma. Si eres proveedor, selecciona 'Proveedor' al registrarte para acceder a tu portal especializado." },
];

function getLocalReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const r of LOCAL_RESPONSES) {
    if (r.keywords.some(kw => lower.includes(kw))) return r.reply;
  }
  return "¡Puedo ayudarte con estilos, materiales, precios, tokens o cómo usar la plataforma! Escribe palabras como: precios, estilos, materiales, tokens, proveedores, o comisiones. 💡";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '¡Hola! 👋 Soy el asistente de AMBAR STUDIO. Pregúntame sobre precios, estilos, materiales, tokens o proveedores de Aguascalientes. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await api.sendChat({ message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      // Fallback to local responses when API is unavailable
      const localReply = getLocalReply(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: localReply }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="chat-widget-toggle-pill" aria-label="Abrir chat">
        <span className="material-symbols-outlined filled" style={{ fontSize: 20 }}>support_agent</span>
        ¿Necesitas ayuda?
      </button>
    );
  }

  return (
    <div className="chat-widget animate-fade-in-up">
      <div className="chat-widget-header">
        <div className="chat-widget-header-title">
          <span className="material-symbols-outlined filled" style={{ fontSize: 20 }}>support_agent</span>
          <div>
            <div>Asistente AMBAR</div>
            <div className="chat-widget-header-subtitle">Siempre disponible · Aguascalientes</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="chat-widget-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-widget-message ${m.role === 'user' ? 'user' : 'assistant'}`}
            style={{ whiteSpace: 'pre-wrap' }}>
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-widget-message assistant animate-pulse">Escribiendo...</div>}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && (
        <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--outline-variant)' }}>
          {['Precios', 'Estilos', 'Tokens', 'Proveedores'].map(q => (
            <button key={q} onClick={() => { setInput(q); }} style={{
              padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 11,
              background: 'var(--surface-container)', color: 'var(--primary)',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-label)', fontWeight: 600
            }}>{q}</button>
          ))}
        </div>
      )}

      <div className="chat-widget-footer">
        <input value={input} onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && send()}
          placeholder="Escribe tu pregunta..." className="chat-widget-input" />
        <button onClick={send} className="btn btn-primary" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
        </button>
      </div>
    </div>
  );
}
