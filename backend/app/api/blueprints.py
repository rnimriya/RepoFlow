"""
Blueprint API routes — the core search/generation endpoint.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_user_profile
from app.core.config import get_settings
from app.db.client import get_supabase
from app.db.models import SearchRequest, SearchResponse
from app.rag.pipeline import generate_blueprint

router = APIRouter(prefix="/blueprints", tags=["blueprints"])
settings = get_settings()


def _check_search_limit(profile: dict) -> None:
    """Raises 429 if the user has hit their monthly search limit."""
    tier = profile["tier"]
    count = profile["search_count"]

    limits = {
        "free": 5,
        "starter": settings.STARTER_SEARCH_LIMIT,
        "pro": settings.PRO_SEARCH_LIMIT,
    }
    limit = limits.get(tier, 5)
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly search limit ({limit}) reached for your '{tier}' plan. Upgrade to continue.",
        )


@router.post("/search", response_model=SearchResponse, status_code=201)
async def search_blueprint(
    request: SearchRequest,
    profile: dict = Depends(get_user_profile),
):
    """
    Core endpoint: accepts a natural language query and returns
    a generated Integration Blueprint with source attribution.
    """
    _check_search_limit(profile)

    user_id = profile["id"]
    tier = profile["tier"]

    # Generate the Blueprint via RAG pipeline
    blueprint, model_name, latency_ms, tokens_used = await generate_blueprint(
        query=request.query,
        user_id=user_id,
        tier=tier,
        top_k=request.top_k,
    )

    # Persist to Supabase
    supabase = get_supabase()
    blueprint_id = str(uuid.uuid4())

    supabase.table("blueprints").insert({
        "id": blueprint_id,
        "user_id": user_id,
        "query": request.query,
        "blueprint_md": blueprint.model_dump_json(),
        "glue_frontend": blueprint.glue_frontend.code,
        "glue_backend": blueprint.glue_backend.code,
        "integration_steps": blueprint.integration_steps,
        "sources": [s.model_dump() for s in blueprint.sources],
        "ai_model": model_name,
        "tier_at_creation": tier,
        "tokens_used": tokens_used,
        "latency_ms": latency_ms,
    }).execute()

    # Increment search count
    supabase.table("profiles").update({
        "search_count": profile["search_count"] + 1
    }).eq("id", user_id).execute()

    # Record search history
    supabase.table("search_history").insert({
        "user_id": user_id,
        "query": request.query,
        "blueprint_id": blueprint_id,
        "tier": tier,
    }).execute()

    return SearchResponse(
        blueprint_id=blueprint_id,
        blueprint=blueprint,
        ai_model=model_name,
        latency_ms=latency_ms,
        tokens_used=tokens_used,
    )


@router.get("/{blueprint_id}", response_model=SearchResponse)
async def get_blueprint(
    blueprint_id: str,
    profile: dict = Depends(get_user_profile),
):
    """Retrieve a previously generated Blueprint by ID."""
    supabase = get_supabase()
    result = supabase.table("blueprints") \
        .select("*") \
        .eq("id", blueprint_id) \
        .eq("user_id", profile["id"]) \
        .single() \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Blueprint not found")

    row = result.data
    import json
    blueprint_dict = json.loads(row["blueprint_md"])
    from app.db.models import Blueprint
    blueprint = Blueprint(**blueprint_dict)

    return SearchResponse(
        blueprint_id=blueprint_id,
        blueprint=blueprint,
        ai_model=row["ai_model"],
        latency_ms=row["latency_ms"],
        tokens_used=row.get("tokens_used"),
    )


@router.get("/", response_model=list[dict])
async def list_blueprints(profile: dict = Depends(get_user_profile)):
    """List the current user's blueprint history (most recent first)."""
    supabase = get_supabase()
    result = supabase.table("blueprints") \
        .select("id, query, ai_model, tier_at_creation, created_at") \
        .eq("user_id", profile["id"]) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return result.data or []


@router.patch("/{blueprint_id}/feedback")
async def submit_feedback(
    blueprint_id: str,
    rating: int,
    feedback: str | None = None,
    profile: dict = Depends(get_user_profile),
):
    """Submit a 1-5 star rating and optional feedback on a Blueprint."""
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    supabase = get_supabase()
    supabase.table("blueprints").update({
        "rating": rating,
        "feedback": feedback,
    }).eq("id", blueprint_id).eq("user_id", profile["id"]).execute()

    return {"status": "ok"}
