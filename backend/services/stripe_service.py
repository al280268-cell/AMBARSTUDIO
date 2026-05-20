"""
AMBAR STUDIO — Payment Service
Plan definitions, token costs, and provider commission configuration.
Stripe integration has been restored.
"""
import logging
import uuid
from typing import Optional, Tuple
from config import settings

logger = logging.getLogger("ambar.payments")

# ── Stripe initialization ──
_stripe_ready = False
try:
    import stripe
    import certifi
    if settings.STRIPE_SECRET_KEY:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        # Fix for Python 3.9 OpenSSL issues
        stripe.ca_bundle_path = certifi.where()
        _stripe_ready = True
        logger.info("Stripe service initialized successfully with certifi")
except ImportError:
    logger.warning("Stripe library not installed. Payments will run in demo mode.")
except Exception as e:
    logger.error(f"Error initializing Stripe: {e}")

# ──────────────────────────────────────────────
# Plan configuration — prices in MXN
# ──────────────────────────────────────────────
PLANS = {
    "habitacion": {
        "name": "Plan Habitación",
        "price": 4900,  # centavos MXN ($49)
        "price_display": 49.00,
        "tokens": 120,
        "max_area": 25,
        "description": "Hasta 25m² — 120 tokens",
        "entregable": "Lista de materiales + Presupuesto",
        "provider_access": True,
    },
    "depto": {
        "name": "Plan Departamento",
        "price": 9900,  # centavos MXN ($99)
        "price_display": 99.00,
        "tokens": 250,
        "max_area": 90,
        "description": "Hasta 90m² — 250 tokens",
        "entregable": "Plano de distribución sugerido (2D básico)",
        "provider_access": True,
    },
    "casa": {
        "name": "Plan Casa",
        "price": 14900,  # centavos MXN ($149)
        "price_display": 149.00,
        "tokens": 500,
        "max_area": 250,
        "description": "Hasta 250m² — 500 tokens",
        "entregable": "Plano Arquitectónico IA (Muros, instalaciones)",
        "provider_access": True,
    },
    "edificio": {
        "name": "Plan Edificio",
        "price": 19900,  # centavos MXN ($199)
        "price_display": 199.00,
        "tokens": 9999,  # "ilimitados"
        "max_area": 99999,  # sin límite
        "description": "Sin límite — Tokens ilimitados",
        "entregable": "Análisis de Viabilidad y Planos Técnicos Pro",
        "provider_access": True,
    },
    "tokens_100": {
        "name": "Recarga de 100 Créditos",
        "price": 2900,  # centavos MXN ($29)
        "price_display": 29.00,
        "tokens": 100,
        "max_area": None,
        "description": "+100 créditos para renders, planos y más",
        "entregable": None,
        "provider_access": None,
    },
}

# ──────────────────────────────────────────────
# Token consumption costs per action
# ──────────────────────────────────────────────
TOKEN_COSTS = {
    "render_hd": 15,
    "plano_2d_3d": 25,
    "cambio_material": 5,
    "escaneo_espacio": 5,
    "reporte_pdf": 10,
}

def is_stripe_ready() -> bool:
    """Check if Stripe is fully configured and ready."""
    return _stripe_ready

# ──────────────────────────────────────────────
# Checkout Session
# ──────────────────────────────────────────────
async def create_checkout_session(
    plan_key: str,
    user_id: int,
    success_url: str,
    cancel_url: str,
) -> dict:
    plan = PLANS.get(plan_key)
    if not plan:
        raise ValueError(f"Plan '{plan_key}' no existe")

    if not _stripe_ready:
        logger.info(f"Demo checkout: user={user_id}, plan={plan_key}")
        return _create_demo_session(success_url)

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "mxn",
                    "product_data": {
                        "name": plan["name"],
                        "description": plan.get("description", ""),
                    },
                    "unit_amount": plan["price"],
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url + ("&" if "?" in success_url else "?") + "session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            client_reference_id=str(user_id),
            metadata={
                "plan": plan_key,
                "user_id": str(user_id),
                "tokens": str(plan["tokens"]),
            }
        )
        return {
            "checkout_url": session.url,
            "session_id": session.id,
        }
    except Exception as e:
        logger.error(f"Error creating Stripe checkout session: {e}")
        raise ValueError("Error al conectar con la pasarela de pago")

def _create_demo_session(success_url: str) -> dict:
    demo_session_id = f"demo_cs_{uuid.uuid4().hex[:16]}"
    separator = "&" if "?" in success_url else "?"
    demo_url = f"{success_url}{separator}session_id={demo_session_id}&demo=true"
    return {
        "checkout_url": demo_url,
        "session_id": demo_session_id,
    }

# ──────────────────────────────────────────────
# Session Verification
# ──────────────────────────────────────────────
def verify_checkout_session(session_id: str) -> Tuple[bool, Optional[dict]]:
    if session_id.startswith("demo_cs_"):
        return True, None

    if not _stripe_ready:
        return False, None

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        is_paid = session.payment_status == "paid"
        return is_paid, session.metadata
    except Exception as e:
        logger.error(f"Error verifying Stripe session: {e}")
        return False, None

def get_plan_info(plan_key: str) -> Optional[dict]:
    return PLANS.get(plan_key)

def get_token_cost(action: str) -> int:
    return TOKEN_COSTS.get(action, 15)
