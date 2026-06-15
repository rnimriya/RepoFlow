"""
RepoFlow AI — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="RepoFlow AI API",
    description="Generate Integration Blueprints connecting frontend UI to backend APIs.",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)

# CORS — allow the Next.js frontend and VS Code extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
# Import routers lazily so missing optional deps don't crash startup.
# Full routes are loaded when the relevant packages are installed.

try:
    from app.api import blueprints
    app.include_router(blueprints.router, prefix="/api/v1")
except ImportError as e:
    import logging
    logging.warning(f"blueprints router not loaded (missing deps): {e}")

try:
    from app.api import stripe_webhooks
    app.include_router(stripe_webhooks.router, prefix="/api/v1")
except ImportError as e:
    import logging
    logging.warning(f"stripe_webhooks router not loaded (missing deps): {e}")


@app.get("/health")
async def health_check():
    return {"status": "ok", "env": settings.APP_ENV, "version": "0.1.0"}


@app.get("/api/v1/status")
async def api_status():
    """Returns which optional service integrations are configured."""
    cfg = get_settings()
    return {
        "openai":   cfg.OPENAI_API_KEY != "sk-placeholder",
        "pinecone": cfg.PINECONE_API_KEY != "pcsk-placeholder",
        "supabase": cfg.SUPABASE_URL != "https://placeholder.supabase.co",
        "stripe":   cfg.STRIPE_SECRET_KEY != "sk_test_placeholder",
    }
