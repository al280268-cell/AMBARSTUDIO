"""
AMBAR STUDIO — Demo Data Seeder
Datos de demostración para Aguascalientes: proveedores, productos, proyectos, cotizaciones y reseñas.
Se ejecuta automáticamente al iniciar si la DB está vacía.
"""
from database import SessionLocal
import models
from auth import hash_password


# ── Proveedores de Aguascalientes con productos ──
PROVIDERS = [
    {"user": {"email": "maderas@proveedores.com", "name": "Carlos Rodríguez"},
     "profile": {"business_name": "Maderas del Centro AGS", "bio": "Fabricantes de pisos y muebles de madera de encino y mezquite. 15 años de experiencia en Aguascalientes.", "categories": ["madera", "suelos", "mobiliario"], "whatsapp": "wa.me/524491234567", "instagram": "@maderasdelcentro", "contact_email": "ventas@maderasdelcentro.mx", "coverage": "local", "city": "Aguascalientes", "lat": 21.8818, "lng": -102.2916, "rating": 4.8, "review_count": 27, "verified": True, "image_url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80"},
     "products": [
         {"name": "Piso de Encino Natural", "description": "Duela maciza de encino, acabado al aceite. 120x15cm.", "price": 1250.0, "unit": "m²", "category": "suelos", "image_url": "/products/wood_floors.png"},
         {"name": "Mesa de Mezquite Artesanal", "description": "Mesa de comedor tallada a mano en mezquite sólida. 180x90cm.", "price": 18500.0, "unit": "unidad", "category": "mobiliario", "image_url": "/products/wood_floors.png"},
         {"name": "Estantería de Roble FSC", "description": "Almacenamiento abierto madera certificada FSC. 180x80x35cm.", "price": 5800.0, "unit": "unidad", "category": "mobiliario", "image_url": "/products/wood_floors.png"},
     ]},
    {"user": {"email": "ilumina@proveedores.com", "name": "Ana Sofía Martínez"},
     "profile": {"business_name": "Ilumina Studio AGS", "bio": "Diseño de iluminación residencial y comercial. Lámparas artesanales y sistemas LED inteligentes.", "categories": ["iluminacion", "decoracion", "electrico"], "whatsapp": "wa.me/524499876543", "instagram": "@iluminastudio", "contact_email": "hola@iluminastudio.mx", "coverage": "local", "city": "Aguascalientes", "lat": 21.8853, "lng": -102.2960, "rating": 4.9, "review_count": 34, "verified": True, "image_url": "https://images.unsplash.com/photo-1598928506311-c55ece137a0d?w=400&q=80"},
     "products": [
         {"name": "Foco LED Empotrado 3000K", "description": "Iluminación cálida empotrada. Ahorro energético 85%.", "price": 520.0, "unit": "unidad", "category": "iluminacion", "image_url": "/products/lighting.png"},
         {"name": "Riel de Luz LED Lineal", "description": "Iluminación lineal bajo gabinetes. Regulable.", "price": 1200.0, "unit": "metros lineales", "category": "iluminacion", "image_url": "/products/lighting.png"},
         {"name": "Lámpara Colgante Artesanal", "description": "Pantalla de fibra natural tejida a mano con LED.", "price": 2100.0, "unit": "unidad", "category": "iluminacion", "image_url": "/products/lighting.png"},
     ]},
    {"user": {"email": "textilnatura@proveedores.com", "name": "María Fernanda López"},
     "profile": {"business_name": "Textil Natura AGS", "bio": "Textiles artesanales de algodón y lino para cortinas y tapicería. Tintes naturales.", "categories": ["textiles", "cortinas", "tapiceria"], "whatsapp": "wa.me/524492345678", "instagram": "@textilnatura", "contact_email": "info@textilnatura.com", "coverage": "local", "city": "Aguascalientes", "lat": 21.8790, "lng": -102.3005, "rating": 4.7, "review_count": 19, "verified": True, "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80"},
     "products": [
         {"name": "Cortina de Lino Orgánico", "description": "Tejido sostenible sin pesticidas. Caída elegante.", "price": 750.0, "unit": "metros lineales", "category": "cortinas", "image_url": "/products/textiles.png"},
         {"name": "Cojines de Algodón Reciclado", "description": "Set de 4 cojines tonos neutros y terracota.", "price": 1200.0, "unit": "set", "category": "tapiceria", "image_url": "/products/textiles.png"},
         {"name": "Alfombra de Yute Artesanal", "description": "Fibra natural biodegradable. 200x150cm.", "price": 3200.0, "unit": "unidad", "category": "textiles", "image_url": "/products/textiles.png"},
     ]},
    {"user": {"email": "ceramica@proveedores.com", "name": "Roberto Álvarez"},
     "profile": {"business_name": "Cerámica Aguascalientes", "bio": "Pisos cerámicos y recubrimientos artesanales de alta temperatura.", "categories": ["ceramica", "pisos", "muros"], "whatsapp": "wa.me/524493456789", "instagram": "@ceramicaags", "contact_email": "ventas@ceramicaags.mx", "coverage": "local", "city": "Aguascalientes", "lat": 21.8845, "lng": -102.2850, "rating": 4.6, "review_count": 22, "verified": True, "image_url": "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=80"},
     "products": [
         {"name": "Porcelanato Rectificado 60x120", "description": "Gran formato efecto cemento. Alta resistencia.", "price": 820.0, "unit": "m²", "category": "pisos", "image_url": "/products/ceramics.png"},
         {"name": "Azulejo Artesanal Talavera", "description": "Diseño mexicano pintado a mano. 15x15cm.", "price": 350.0, "unit": "m²", "category": "muros", "image_url": "/products/ceramics.png"},
         {"name": "Mosaico Hexagonal", "description": "Cerámica esmaltada tonos terracota y crema.", "price": 680.0, "unit": "m²", "category": "pisos", "image_url": "/products/ceramics.png"},
     ]},
    {"user": {"email": "hierro@proveedores.com", "name": "Diego Castañeda"},
     "profile": {"business_name": "Herrería Artística AGS", "bio": "Mobiliario y estructuras en acero y hierro forjado. Diseño industrial artesanal.", "categories": ["metal", "mobiliario", "herreria"], "whatsapp": "wa.me/524494567890", "instagram": "@herreriaags", "contact_email": "taller@herreriaags.com", "coverage": "local", "city": "Aguascalientes", "lat": 21.8760, "lng": -102.2980, "rating": 4.5, "review_count": 16, "verified": True, "image_url": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80"},
     "products": [
         {"name": "Barandal de Hierro Forjado", "description": "Diseño clásico, acabado electrostático negro.", "price": 2800.0, "unit": "metros lineales", "category": "herreria", "image_url": "/products/metalwork.png"},
         {"name": "Estantería Industrial", "description": "Tubo industrial con repisas de madera reciclada.", "price": 5900.0, "unit": "unidad", "category": "mobiliario", "image_url": "/products/metalwork.png"},
         {"name": "Mesa de Acero y Vidrio", "description": "Metal recuperado + vidrio templado 10mm.", "price": 4100.0, "unit": "unidad", "category": "mobiliario", "image_url": "/products/metalwork.png"},
     ]},
    {"user": {"email": "pinturas@proveedores.com", "name": "Laura Esparza"},
     "profile": {"business_name": "ColorHogar Pinturas", "bio": "Pinturas premium y acabados decorativos. Asesoría en color para proyectos.", "categories": ["pintura", "acabados", "decoracion"], "whatsapp": "wa.me/524495678901", "instagram": "@colorhogarags", "contact_email": "contacto@colorhogar.mx", "coverage": "local", "city": "Aguascalientes", "lat": 21.8830, "lng": -102.2890, "rating": 4.4, "review_count": 13, "verified": True, "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80"},
     "products": [
         {"name": "Pintura Blanco Mate Cero VOC", "description": "Pintura ecológica sin emisiones tóxicas.", "price": 300.0, "unit": "litros", "category": "pintura", "image_url": "/products/paints.png"},
         {"name": "Pintura Terracota Mineral", "description": "Tono cálido tierra natural transpirable.", "price": 320.0, "unit": "litros", "category": "pintura", "image_url": "/products/paints.png"},
         {"name": "Microcemento Base Ecológica", "description": "Revestimiento mineral sin resinas epóxicas.", "price": 1050.0, "unit": "m²", "category": "acabados", "image_url": "/products/paints.png"},
     ]},
]

# ── Proyectos demo con materiales ──
PROJECTS = [
    {"name": "Sala Principal", "image": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80", "style": "Minimalista", "w": 6.0, "l": 4.5, "h": 3.0,
     "materials": [
         {"category": "suelos", "name": "Microcemento pulido", "description": "Acabado continuo gris claro.", "estimated_quantity": 29.7, "unit": "m²", "estimated_unit_cost": 45.0, "estimated_total_cost": 1336.5, "icon": "square_foot"},
         {"category": "iluminacion", "name": "Focos empotrados LED 3000K", "description": "Iluminación cálida empotrada.", "estimated_quantity": 5, "unit": "unidades", "estimated_unit_cost": 25.0, "estimated_total_cost": 125.0, "icon": "lightbulb"},
         {"category": "pintura", "name": "Pintura blanco mate premium", "description": "Alta cobertura para paredes.", "estimated_quantity": 6.2, "unit": "litros", "estimated_unit_cost": 12.0, "estimated_total_cost": 74.4, "icon": "format_paint"},
         {"category": "textiles", "name": "Cortinas de lino natural", "description": "Lino europeo con caída orgánica.", "estimated_quantity": 7.8, "unit": "metros lineales", "estimated_unit_cost": 35.0, "estimated_total_cost": 273.0, "icon": "curtains"},
         {"category": "mobiliario", "name": "Estantería roble nórdico", "description": "Almacenamiento abierto madera clara.", "estimated_quantity": 2, "unit": "unidades", "estimated_unit_cost": 280.0, "estimated_total_cost": 560.0, "icon": "shelves"},
     ]},
    {"name": "Recámara Master", "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", "style": "Hogareño Cálido", "w": 5.0, "l": 4.0, "h": 2.8,
     "materials": [
         {"category": "suelos", "name": "Tarima de roble europeo", "description": "Madera maciza acabado natural.", "estimated_quantity": 22.0, "unit": "m²", "estimated_unit_cost": 65.0, "estimated_total_cost": 1430.0, "icon": "square_foot"},
         {"category": "iluminacion", "name": "Lámparas de pie textil", "description": "Iluminación cálida ambiental.", "estimated_quantity": 3, "unit": "unidades", "estimated_unit_cost": 95.0, "estimated_total_cost": 285.0, "icon": "lightbulb"},
         {"category": "pintura", "name": "Pintura terracota suave", "description": "Tono cálido para muros.", "estimated_quantity": 5.0, "unit": "litros", "estimated_unit_cost": 14.0, "estimated_total_cost": 70.0, "icon": "format_paint"},
         {"category": "textiles", "name": "Alfombra de yute tejida", "description": "Fibra natural artesanal.", "estimated_quantity": 8.0, "unit": "m²", "estimated_unit_cost": 42.0, "estimated_total_cost": 336.0, "icon": "curtains"},
     ]},
    {"name": "Cocina Integral", "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", "style": "Moderno", "w": 4.0, "l": 3.5, "h": 2.7,
     "materials": [
         {"category": "suelos", "name": "Porcelanato gris 60x120", "description": "Gran formato efecto cemento.", "estimated_quantity": 15.4, "unit": "m²", "estimated_unit_cost": 38.0, "estimated_total_cost": 585.2, "icon": "square_foot"},
         {"category": "iluminacion", "name": "Riel LED lineal", "description": "Bajo gabinetes, regulable.", "estimated_quantity": 4.0, "unit": "metros lineales", "estimated_unit_cost": 55.0, "estimated_total_cost": 220.0, "icon": "lightbulb"},
         {"category": "mobiliario", "name": "Gabinetes lacados blancos", "description": "Cocina integral MDF lacado mate.", "estimated_quantity": 1, "unit": "set", "estimated_unit_cost": 1800.0, "estimated_total_cost": 1800.0, "icon": "kitchen"},
     ]},
]

REVIEWS = [
    {"idx": 0, "rating": 5, "comment": "Excelente calidad en pisos de madera. Instalación rápida y profesional."},
    {"idx": 1, "rating": 5, "comment": "Las lámparas son hermosas. Muy buen trato y puntualidad."},
    {"idx": 2, "rating": 4, "comment": "Buena calidad en textiles. Las cortinas quedaron perfectas."},
    {"idx": 3, "rating": 5, "comment": "Los azulejos artesanales transformaron mi baño completamente."},
    {"idx": 4, "rating": 4, "comment": "Excelente herrería del barandal. Diseño industrial perfecto."},
]


def seed_demo_data():
    """Seed database with demo data if empty."""
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        print("[SEED] Seeding demo data for Aguascalientes...")

        # Users
        user = models.User(email="demo@ambar.studio", password_hash=hash_password("Demo2024!"), name="Julián Arcas", role="user", tokens_balance=15, plan="free", city="Aguascalientes")
        admin = models.User(email="admin@ambar.studio", password_hash=hash_password("Admin2024!"), name="Administrador", role="admin", tokens_balance=9999, plan="admin", city="Aguascalientes")
        db.add_all([user, admin])
        db.flush()

        # Providers + Products
        provider_ids = []
        for pd in PROVIDERS:
            prov_user = models.User(email=pd["user"]["email"], password_hash=hash_password("Proveedor2024!"), name=pd["user"]["name"], role="provider", tokens_balance=0, plan="provider", city="Aguascalientes")
            db.add(prov_user)
            db.flush()
            provider = models.Provider(user_id=prov_user.id, **pd["profile"])
            db.add(provider)
            db.flush()
            provider_ids.append(provider.id)
            for prod in pd.get("products", []):
                db.add(models.Product(provider_id=provider.id, **prod))

        # Projects + Materials
        project_ids = []
        for p in PROJECTS:
            proj = models.Project(user_id=user.id, name=p["name"], original_image="", generated_image=p["image"], style=p["style"], width=p["w"], length=p["l"], height=p["h"], area=p["w"] * p["l"], status="completed", ai_prompt_used=f"Interior design render — {p['style']}")
            db.add(proj)
            db.flush()
            project_ids.append(proj.id)
            for m in p["materials"]:
                db.add(models.Material(project_id=proj.id, **m))

        # Quotes
        db.add(models.Quote(project_id=project_ids[0], provider_id=provider_ids[0], user_id=user.id, status="responded", user_message="Me interesa cotizar microcemento y cortinas para mi sala de 27m².", provider_response="¡Con gusto! Microcemento $1,250 MXN/m² instalado. Cortinas $450 MXN/metro. Visita sin costo en Aguascalientes.", quoted_amount=38250.0))
        db.add(models.Quote(project_id=project_ids[0], provider_id=provider_ids[1], user_id=user.id, status="pending", user_message="Busco iluminación LED empotrada. 27m² de sala.", provider_response="", quoted_amount=None))
        db.add(models.Quote(project_id=project_ids[1], provider_id=provider_ids[2], user_id=user.id, status="responded", user_message="Cortinas y cojines para recámara 20m², estilo cálido.", provider_response="Cortinas algodón orgánico $380/metro, cojines $550. Podemos agendar visita.", quoted_amount=4200.0))

        # Reviews
        for r in REVIEWS:
            db.add(models.Review(user_id=user.id, provider_id=provider_ids[r["idx"]], rating=r["rating"], comment=r["comment"]))

        db.commit()
        print("[OK] Demo: demo@ambar.studio / Demo2024! | admin@ambar.studio / Admin2024! | Proveedores: Proveedor2024!")
    except Exception as e:
        print(f"[ERROR] Seed: {e}")
        db.rollback()
    finally:
        db.close()
