"""
AMBAR STUDIO — AI Service
Handles AI design generation and materials calculation.
Supports both real OpenAI API and demo mode.
"""
import os
import json
import random
import asyncio
from typing import List, Dict, Any
from config import settings

APP_MODE = settings.APP_MODE
OPENAI_API_KEY = settings.OPENAI_API_KEY
GEMINI_API_KEY = settings.GEMINI_API_KEY

# Only import openai if we have a key
if OPENAI_API_KEY and APP_MODE != "demo":
    import openai
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
else:
    client = None

if GEMINI_API_KEY and APP_MODE != "demo":
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    gemini_model = None


# ──────────────────────────────────────────────
# Style Normalization
# ──────────────────────────────────────────────
STYLE_ALIASES = {
    "minimalista": "Minimalista",
    "moderno": "Moderno",
    "hogareno calido": "Hogareno Calido",
    "hogareño cálido": "Hogareno Calido",
    "hogareno cálido": "Hogareno Calido",
    "hogareño calido": "Hogareno Calido",
    "escandinavo organico": "Escandinavo Organico",
    "escandinavo orgánico": "Escandinavo Organico",
    "brutalismo suave": "Brutalismo Suave",
}


def _normalize_style(style: str) -> str:
    """Normalize style name to match internal keys (no accents)."""
    key = style.strip().lower()
    return STYLE_ALIASES.get(key, style)


# ──────────────────────────────────────────────
# Demo Data (used when no real API key is set)
# ──────────────────────────────────────────────
DEMO_IMAGES = {
    "Minimalista": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    "Moderno": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    "Hogareno Calido": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    "Escandinavo Organico": "https://images.unsplash.com/photo-1598928506311-c55ece137a0d?w=800&q=80",
    "Brutalismo Suave": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
}

STYLE_MATERIALS = {
    "Minimalista": [
        {"category": "suelos", "name": "Microcemento pulido (Eco-friendly)", "description": "Acabado continuo base agua, bajo en VOC y huella de carbono reducida.", "unit": "m²", "cost_per_unit": 950.0, "icon": "square_foot"},
        {"category": "iluminacion", "name": "Focos empotrados LED Ultra-Eficientes", "description": "Iluminacion calida que ahorra 85% de energia vs focos tradicionales.", "unit": "unidades", "cost_per_unit": 520.0, "icon": "lightbulb"},
        {"category": "pintura", "name": "Pintura blanco mate Cero VOC", "description": "Pintura ecologica sin emisiones toxicas, ideal para calidad del aire interior.", "unit": "litros", "cost_per_unit": 300.0, "icon": "format_paint"},
        {"category": "textiles", "name": "Cortinas de lino organico", "description": "Tejido cultivado de forma sostenible sin pesticidas.", "unit": "metros lineales", "cost_per_unit": 750.0, "icon": "curtains"},
        {"category": "mobiliario", "name": "Estanteria madera FSC", "description": "Madera de bosques gestionados de forma 100% responsable.", "unit": "unidades", "cost_per_unit": 5800.0, "icon": "shelves"},
    ],
    "Moderno": [
        {"category": "suelos", "name": "Porcelanato reciclado gris", "description": "Ceramica fabricada con 40% de material reciclado post-consumo.", "unit": "m²", "cost_per_unit": 820.0, "icon": "square_foot"},
        {"category": "iluminacion", "name": "Riel de luz LED inteligente", "description": "Sistema lineal regulable con sensores de luz natural para ahorrar energia.", "unit": "metros lineales", "cost_per_unit": 1200.0, "icon": "lightbulb"},
        {"category": "pintura", "name": "Pintura base agua mineral", "description": "Tono gris libre de quimicos contaminantes y microplasticos.", "unit": "litros", "cost_per_unit": 350.0, "icon": "format_paint"},
        {"category": "vidrio", "name": "Panel de vidrio termo-eficiente", "description": "Vidrio templado que mejora el aislamiento termico del espacio.", "unit": "m²", "cost_per_unit": 2600.0, "icon": "glass_cup"},
        {"category": "mobiliario", "name": "Mesa acero reciclado y vidrio", "description": "Estructura de metal 100% recuperado y fundido localmente.", "unit": "unidades", "cost_per_unit": 4100.0, "icon": "table_restaurant"},
    ],
    "Hogareno Calido": [
        {"category": "suelos", "name": "Tarima de bambu organico", "description": "Alternativa ecologica a la madera, de rapido crecimiento y alta resistencia.", "unit": "m²", "cost_per_unit": 1250.0, "icon": "square_foot"},
        {"category": "iluminacion", "name": "Lamparas con luz solar indirecta", "description": "Sistemas hibridos con captacion de luz diurna.", "unit": "unidades", "cost_per_unit": 2100.0, "icon": "lightbulb"},
        {"category": "pintura", "name": "Pintura de arcilla terracota", "description": "Pintura 100% natural transpirable que regula la humedad.", "unit": "litros", "cost_per_unit": 320.0, "icon": "format_paint"},
        {"category": "textiles", "name": "Alfombra de yute artesanal", "description": "Fibra biodegradable y compostable al final de su vida util.", "unit": "m²", "cost_per_unit": 890.0, "icon": "curtains"},
        {"category": "decoracion", "name": "Cojines de algodon reciclado", "description": "Textiles elaborados a partir de prendas recuperadas (Zero Waste).", "unit": "set", "cost_per_unit": 1200.0, "icon": "weekend"},
    ],
    "Escandinavo Organico": [
        {"category": "suelos", "name": "Piso de corcho natural", "description": "Aislante acustico y termico sostenible, cosechado sin talar el arbol.", "unit": "m²", "cost_per_unit": 900.0, "icon": "square_foot"},
        {"category": "iluminacion", "name": "Lampara colgante de carton reciclado", "description": "Pantalla ecologica fabricada con celulosa reutilizada.", "unit": "unidades", "cost_per_unit": 1100.0, "icon": "lightbulb"},
        {"category": "pintura", "name": "Blanco a la cal tradicional", "description": "Revestimiento natural antiseptico que purifica el aire.", "unit": "litros", "cost_per_unit": 190.0, "icon": "format_paint"},
        {"category": "textiles", "name": "Manta de lana etica", "description": "Lana de origen cruelty-free sin tintes toxicos.", "unit": "unidades", "cost_per_unit": 1850.0, "icon": "curtains"},
        {"category": "mobiliario", "name": "Silla de madera recuperada", "description": "Madera rescatada de demoliciones locales y restaurada.", "unit": "unidades", "cost_per_unit": 3200.0, "icon": "chair"},
    ],
    "Brutalismo Suave": [
        {"category": "suelos", "name": "Hormigon ecologico (Eco-Crete)", "description": "Concreto con 30% menos de cemento Portland, usando cenizas volantes.", "unit": "m²", "cost_per_unit": 1150.0, "icon": "square_foot"},
        {"category": "iluminacion", "name": "Foco industrial LED vintage", "description": "Aparato restaurado (Upcycling) adaptado a bajo consumo.", "unit": "unidades", "cost_per_unit": 850.0, "icon": "lightbulb"},
        {"category": "pintura", "name": "Microcemento base ecologica", "description": "Revestimiento mineral sin resinas epoxicas contaminantes.", "unit": "m²", "cost_per_unit": 1050.0, "icon": "format_paint"},
        {"category": "metal", "name": "Estanteria tubo industrial rescatado", "description": "Upcycling de tuberias en desuso con maderas de pale.", "unit": "unidades", "cost_per_unit": 5900.0, "icon": "shelves"},
        {"category": "textiles", "name": "Cortina de loneta de cañamo", "description": "Textil de minimo impacto hidrico y alta durabilidad.", "unit": "metros lineales", "cost_per_unit": 950.0, "icon": "curtains"},
    ],
}


def _calculate_quantity(material: dict, area: float, height: float) -> float:
    """Calculate estimated quantity based on material type and room dimensions."""
    cat = material["category"]
    unit = material["unit"]

    if cat == "suelos":
        return round(area * 1.1, 1)  # +10% for waste
    elif cat == "pintura":
        wall_area = 2 * (area**0.5) * height * 2  # Rough wall area estimate
        coverage_per_liter = 10  # m² per liter
        return round(wall_area / coverage_per_liter, 1)
    elif cat in ("iluminacion", "iluminación"):
        return max(2, round(area / 6))  # 1 light per 6m²
    elif cat == "textiles" and unit == "metros lineales":
        return round(area**0.5 * 1.5, 1)  # Window estimate
    elif cat == "textiles" and unit == "m²":
        return round(area * 0.4, 1)  # 40% coverage
    elif unit == "unidades":
        return max(1, round(area / 15))
    elif unit == "set":
        return 1
    else:
        return round(area * 0.3, 1)


async def generate_design(
    style: str,
    width: float,
    length: float,
    height: float,
    original_image_path: str = "",
    custom_prompt: str = ""
) -> Dict[str, Any]:
    """
    Generate an AI interior design render.
    Returns image URL and calculated materials.
    """
    area = width * length
    normalized_style = _normalize_style(style)

    # Build prompt for AI
    if "plano" in style.lower():
        prompt = f"""Top-down architectural 2D floor plan blueprint for a {area}m² space ({width}m x {length}m). 
        Style: {normalized_style}. {custom_prompt}.
        Clear architectural drawing, technical blueprint style, precise line art, showing furniture layout, 
        walls, and doors. White background, professional architectural layout."""
    else:
        prompt = f"""Interior design render of a {area}m² room ({width}m x {length}m, {height}m ceiling height) 
        in {normalized_style} style. {custom_prompt}. 
        Photorealistic, professional architectural photography, natural lighting, 
        high-end materials, magazine quality."""

    generated_image = ""

    if client and APP_MODE != "demo":
        # === REAL API MODE ===
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            generated_image = response.data[0].url
        except Exception as e:
            print(f"OpenAI API error: {e}")
            import urllib.parse
            short_prompt = f"Interior design of {area}sqm room, {normalized_style} style. Client request: {custom_prompt}. High quality architectural render"
            encoded_prompt = urllib.parse.quote(short_prompt)
            generated_image = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
    else:
        # === POLLINATIONS API FOR FREE IMAGE GENERATION ===
        import urllib.parse
        short_prompt = f"Interior design of {area}sqm room, {normalized_style} style. Client request: {custom_prompt}. High quality architectural render"
        encoded_prompt = urllib.parse.quote(short_prompt)
        generated_image = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"

    # Calculate materials
    raw_materials = []
    
    if gemini_model and APP_MODE != "demo":
        prompt_data = f"""
        Eres un experto arquitecto y experto en sostenibilidad ambiental. 
        Calcula una lista de 5 materiales necesarios para un espacio de {area}m2, con estilo {normalized_style}. 
        El cliente solicitó específicamente: "{custom_prompt}". Asegúrate de que los materiales se adapten a esta petición.
        Además, genera un sexto ítem en la categoría "Sostenibilidad" que describa el impacto ambiental exacto (ahorro de CO2, agua, etc).
        
        Devuelve ÚNICAMENTE un JSON válido con esta estructura estricta:
        [
          {{
            "category": "suelos",
            "name": "Nombre del material",
            "description": "Descripción",
            "unit": "m²",
            "cost_per_unit": 1500.00,
            "icon": "square_foot"
          }}
        ]
        """
        try:
            data_response = gemini_model.generate_content(
                prompt_data,
                generation_config={"response_mime_type": "application/json"}
            )
            json_text = data_response.text.strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.startswith("```"):
                json_text = json_text[3:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
                
            raw_materials = json.loads(json_text.strip())
            
            # Ensure Sostenibilidad exists
            has_sustainability = any(m.get("category") == "Sostenibilidad" for m in raw_materials)
            if not has_sustainability:
                 raw_materials.append({
                    "category": "Sostenibilidad",
                    "name": "Impacto Ambiental Calculado",
                    "description": "Ahorro de huella de carbono verificado por la IA.",
                    "unit": "reporte",
                    "cost_per_unit": 0.0,
                    "icon": "eco"
                 })
                 
        except Exception as e:
            print(f"Gemini Data Generation error: {e}")
            try:
                print("Response text was:", data_response.text)
            except:
                pass
            style_key = normalized_style if normalized_style in STYLE_MATERIALS else "Minimalista"
            raw_materials = STYLE_MATERIALS[style_key]
    else:
        style_key = normalized_style if normalized_style in STYLE_MATERIALS else "Minimalista"
        raw_materials = STYLE_MATERIALS[style_key]

    materials = []
    total_cost = 0

    for mat in raw_materials:
        qty = _calculate_quantity(mat, area, height)
        cost = float(mat.get("cost_per_unit", 1000.0)) if mat.get("category") != "Sostenibilidad" else 0.0
        total = round(qty * cost, 2)
        total_cost += total
        materials.append({
            "category": mat.get("category", "general"),
            "name": mat.get("name", "Material"),
            "description": mat.get("description", ""),
            "estimated_quantity": qty if mat.get("category") != "Sostenibilidad" else 1,
            "unit": mat.get("unit", "unidades"),
            "estimated_unit_cost": cost,
            "estimated_total_cost": total,
            "icon": mat.get("icon", "check_circle"),
        })

    return {
        "generated_image": generated_image,
        "materials": materials,
        "estimated_total_cost": round(total_cost, 2),
        "ai_prompt_used": prompt,
    }


async def chat_response(message: str, project_context: str = "") -> str:
    """Generate AI chatbot response."""
    system_prompt = """Eres el Asistente Experto en Diseño de Interiores y Arquitectura de AMBAR STUDIO, una plataforma SaaS premium impulsada por Inteligencia Artificial.
Tu objetivo es guiar a los usuarios en la transformación de sus espacios con un tono profesional, elegante, cálido y sumamente útil. Eres la voz de la marca.

CONOCIMIENTO PROFUNDO DE AMBAR STUDIO:
1. Misión de la empresa: Revolucionar el diseño de interiores y la arquitectura haciéndola accesible, rápida y precisa. Permitimos a cualquier persona subir una foto de su espacio y obtener un render 3D, planos arquitectónicos y listas exactas de materiales en segundos.
2. Servicios de IA: Podemos generar Renders 3D fotorrealistas y también Planos 2D / Planos Arquitectónicos precisos si el usuario selecciona esos estilos en el Estudio IA.
3. Moneda y Economía: Todos los precios que estimes o menciones deben estar estrictamente en PESOS MEXICANOS (MXN). Contamos con un sistema de Tokens:
   - Generar cualquier diseño (Render 3D o Plano) cuesta 15 tokens.
   - Plan Discovery (Gratis): 3 tokens gratis de bienvenida. Render simple con marca de agua.
   - Plan Habitación ($49 MXN): Lista de materiales + Presupuesto.
   - Plan Departamento ($99 MXN): Plano de distribución 2D.
   - Plan Casa ($149 MXN): Plano arquitectónico y muros.
   - Plan Edificio ($199 MXN): Análisis de viabilidad técnico.
   - Recargas extra: Se pueden comprar 100 tokens por $29 MXN en cualquier momento.
4. Proveedores y Cotizaciones Reales: Contamos con un ecosistema donde proveedores (tiendas de materiales, contratistas, mueblerías) pueden crear su perfil y subir su catálogo de productos. Nuestra meta es conectar los materiales que tú (la IA) calcules con productos reales de los proveedores locales, especialmente en Aguascalientes y México.

REGLAS DE RESPUESTA:
- Responde siempre en español de México.
- Actúa como el experto definitivo en interiorismo sostenible, arquitectura ecológica, construcción y presupuestos.
- Fomenta fuertemente el cuidado del medio ambiente, opciones de bajo VOC, materiales reciclados y ahorro energético.
- Da consejos reales, prácticos y exactos sobre colores, muebles y técnicas con enfoque eco-friendly.
- Nunca digas que eres un simple programa; eres el asistente avanzado y consciente del medio ambiente de Ambar Studio.
- Mantén las respuestas estructuradas (usa viñetas) y sé conciso pero profundo.
- Si preguntan sobre si pueden imprimir planos, responde que sí, que el Estudio IA ahora genera Planos 2D y Arquitectónicos descargables e imprimibles.
- Sé empático, comercialmente inteligente e inspirador."""

    if project_context:
        system_prompt += f"\n\nContexto del proyecto actual: {project_context}"

    # 1. Try Gemini first if configured
    if gemini_model and APP_MODE != "demo":
        try:
            response = gemini_model.generate_content([system_prompt, message])
            return response.text
        except Exception as e:
            print(f"Gemini Chat error: {e}")

    # 2. Fallback to OpenAI if configured
    elif client and APP_MODE != "demo":
        try:

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Chat error: {e}")

    # === DEMO MODE — intelligent keyword matching ===
    await asyncio.sleep(random.uniform(0.5, 1.5))

    msg_lower = message.lower().strip()

    demo_responses = [
        # Eco / Sustainability
        (["medio ambiente", "sostenible", "ecologico", "ecología", "co2", "arboles", "sustentable", "huella de carbono", "naturaleza", "reciclado"],
         "🌿 **Compromiso Ambiental AMBAR STUDIO**:\nNos enorgullece ser una plataforma *Eco-Friendly*.\n\n• **Ahorro de Materiales**: Calculamos las cantidades exactas para evitar mermas.\n• **Materiales Sustentables**: Priorizamos opciones bajo en VOC, madera certificada FSC, y reciclados.\n• **Reducción de CO2**: Optimizamos diseños para mayor eficiencia energética (iluminación LED inteligente, aislamiento térmico).\n\nCada vez que diseñas con nuestra IA, ahorras CO2 al evitar el ensayo y error tradicional."),

        # Greetings
        (["hola", "buenas", "buen dia", "buenos dias", "hey", "saludos", "que tal"],
         "¡Hola! 👋 Bienvenido a AMBAR STUDIO. Soy tu asistente de diseño inteligente. Puedo ayudarte con estilos, materiales, costos o cualquier duda sobre la plataforma. ¿En qué puedo ayudarte hoy?"),

        # Pricing / Cost
        (["precio", "costo", "cuanto cuesta", "cuánto", "cobran", "tarifa", "presupuesto"],
         "¡Claro! Tenemos 5 planes:\n\n🆓 **Discovery**: Gratis — 15 tokens\n🏠 **Habitación**: $49 MXN — 120 tokens\n🏢 **Departamento**: $99 MXN — 250 tokens\n🏡 **Casa**: $149 MXN — 500 tokens\n🏗️ **Edificio**: $199 MXN — Ilimitados\n\n💡 Recarga: $29 MXN por 100 créditos adicionales. Un render HD cuesta 15 tokens."),

        # Materials
        (["material", "materiales", "madera", "cemento", "piso", "suelo", "pintura"],
         "Trabajamos con una amplia variedad de materiales premium: maderas nobles (roble, abedul), microcemento pulido, porcelanato, textiles naturales (lino, yute, lana merino), vidrio templado y más. Cada estilo tiene su paleta de materiales recomendada que se calcula automáticamente según las dimensiones de tu espacio."),

        # Styles
        (["estilo", "estilos", "minimalista", "moderno", "escandinavo", "brutalismo", "hogareno", "calido"],
         "Ofrecemos 5 estilos de diseño:\n\n• **Minimalista** — Líneas limpias, microcemento, tonos blancos\n• **Moderno** — Porcelanato, vidrio, acabados metálicos\n• **Hogareño Cálido** — Roble, terracota, textiles naturales\n• **Escandinavo Orgánico** — Abedul, papel, lana merino\n• **Brutalismo Suave** — Hormigón pulido, hierro, industrial\n\nCada uno incluye su paleta de materiales y estimación de costos."),

        # How it works
        (["como funciona", "como uso", "como se usa", "ayuda", "tutorial", "pasos", "empezar", "comenzar"],
         "Es muy sencillo: \n\n1️⃣ **Sube una foto** de tu espacio (JPG o PNG)\n2️⃣ **Configura** las dimensiones y selecciona un estilo\n3️⃣ **Genera** — nuestra IA crea un render del diseño (15 tokens)\n4️⃣ **Revisa** los materiales calculados y costos estimados\n5️⃣ **Conecta** con proveedores verificados en Aguascalientes\n\n¡Tienes 15 tokens gratuitos al registrarte!"),

        # Providers
        (["proveedor", "proveedores", "artesano", "cotizar", "cotizacion", "comprar", "donde"],
         "Tenemos 6+ proveedores verificados en Aguascalientes:\n\n🪵 Maderas del Centro AGS\n💡 Ilumina Studio AGS\n🧵 Textil Natura AGS\n🏺 Cerámica Aguascalientes\n⚒️ Herrería Artística AGS\n🎨 ColorHogar Pinturas\n\nAcceso al directorio disponible desde el plan Habitación ($49 MXN). Las comisiones van del 1.5% al 3% según escala del proyecto."),

        # Tokens / Plans
        (["token", "tokens", "plan", "planes", "suscripcion", "render", "renders"],
         "Consumo de tokens por acción:\n\n🎨 Render HD: **15 tokens**\n📐 Plano 2D/3D: **25 tokens**\n🎨 Cambio material: **5 tokens**\n📷 Escaneo espacio: **5 tokens**\n📄 Reporte PDF: **10 tokens**\n\nAl registrarte recibes 15 tokens gratis. Recarga adicional: $29 MXN = 100 créditos."),

        # Thanks
        (["gracias", "thanks", "genial", "perfecto", "excelente"],
         "¡De nada! 😊 Estoy aquí para ayudarte en cualquier momento. Si tienes más preguntas sobre diseño, materiales o la plataforma, no dudes en preguntarme. ¡Éxito con tu proyecto!"),

        # Project-specific
        (["proyecto", "mi proyecto", "diseño", "diseno", "espacio", "habitacion", "cuarto", "sala"],
         "Para crear un proyecto, ve al **Estudio de Diseño IA** desde tu Dashboard. Sube una foto de tu espacio, indica las dimensiones (ancho, largo y alto), elige un estilo y presiona 'Generar Diseño'. En segundos tendrás un render profesional con la lista de materiales y costos estimados."),

        # Sustainability
        (["sostenible", "sustentable", "ecologico", "organico", "natural", "medio ambiente"],
         "En AMBAR STUDIO priorizamos el diseño consciente 🌿. Nuestros estilos incorporan materiales sostenibles: lino europeo, algodón orgánico, madera certificada, fibras naturales como yute, y acabados con bajo impacto ambiental. El estilo Escandinavo Orgánico es especialmente enfocado en sostenibilidad."),
    ]

    for keywords, response in demo_responses:
        if any(kw in msg_lower for kw in keywords):
            return response

    # Default response
    return "¡Gracias por tu mensaje! En AMBAR STUDIO te ayudamos a transformar cualquier espacio con diseño inteligente. Puedo asistirte con:\n\n• Recomendaciones de **estilos** de diseño\n• Información sobre **materiales** y costos\n• Cómo **usar la plataforma**\n• Conectar con **proveedores** verificados\n\n¿Sobre cuál de estos temas te gustaría saber más?"
