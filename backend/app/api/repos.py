"""
Repository API routes — allows users to list, connect, reindex, and delete GitHub repositories.
"""
import uuid
import re
import logging
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status

from app.core.auth import get_user_profile
from app.core.config import get_settings
from app.db.client import get_supabase
from app.db.models import RepoCreate
from app.ingestion.indexer import index_repo

router = APIRouter(prefix="/repos", tags=["repos"])
logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory store for Demo Mode
DEMO_REPOS = {
    "repo-1": {
        "id": "repo-1",
        "github_url": "https://github.com/shadcn-ui/ui",
        "owner": "shadcn-ui",
        "name": "ui",
        "description": "Beautifully designed components that you can copy and paste into your apps.",
        "category": "ui-library",
        "tags": ["react", "tailwind", "components"],
        "stars": 42500,
        "last_indexed_at": "2026-06-15T12:00:00Z",
        "is_active": True,
    },
    "repo-2": {
        "id": "repo-2",
        "github_url": "https://github.com/tiangolo/fastapi",
        "owner": "tiangolo",
        "name": "fastapi",
        "description": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
        "category": "backend",
        "tags": ["python", "fastapi", "api"],
        "stars": 68200,
        "last_indexed_at": "2026-06-15T12:00:00Z",
        "is_active": True,
    },
    "repo-3": {
        "id": "repo-3",
        "github_url": "https://github.com/vercel/next.js",
        "owner": "vercel",
        "name": "next.js",
        "description": "The React Framework",
        "category": "fullstack",
        "tags": ["nextjs", "react", "fullstack"],
        "stars": 121000,
        "last_indexed_at": "2026-06-15T12:00:00Z",
        "is_active": True,
    }
}

def is_real_mode() -> bool:
    return (
        settings.GITHUB_TOKEN != "ghp-placeholder"
        and settings.PINECONE_API_KEY != "pcsk-placeholder"
        and settings.SUPABASE_URL != "https://placeholder.supabase.co"
    )

def parse_github_url(url: str) -> tuple[str, str]:
    match = re.search(r"github\.com/([^/]+)/([^/]+)", url)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub URL. Must be in the format 'https://github.com/owner/repo'"
        )
    owner, repo = match.groups()
    repo = repo.split(".git")[0].split("/")[0]
    return owner, repo

async def simulate_indexing(repo_id: str, owner: str, name: str):
    logger.info(f"Simulating indexing for {owner}/{name}...")
    await asyncio.sleep(5)  # simulate indexing delay
    if repo_id in DEMO_REPOS:
        DEMO_REPOS[repo_id].update({
            "is_active": True,
            "last_indexed_at": datetime.utcnow().isoformat() + "Z",
            "stars": 1234,  # mock stars
            "description": f"Mock indexed repository for {owner}/{name}. Sourced components ready for integration.",
        })
    logger.info(f"Simulated indexing complete for {owner}/{name}.")

async def run_real_indexing(repo_id: str, repo_full_name: str, category: str):
    logger.info(f"Starting real background indexing for {repo_full_name}...")
    try:
        chunks_count = await index_repo(repo_full_name, category)
        logger.info(f"Successfully indexed {chunks_count} chunks for {repo_full_name}.")
        # Update repo status in Supabase
        supabase = get_supabase()
        supabase.table("repos").update({
            "is_active": True,
            "last_indexed_at": datetime.utcnow().isoformat()
        }).eq("id", repo_id).execute()
    except Exception as e:
        logger.error(f"Error during real indexing of {repo_full_name}: {e}")

@router.get("", response_model=list[dict])
async def list_repos(profile: dict = Depends(get_user_profile)):
    """List all registered repositories in the workspace."""
    if profile["id"] == "demo-user-001" or not is_real_mode():
        return list(DEMO_REPOS.values())

    supabase = get_supabase()
    result = supabase.table("repos").select("*").order("created_at", desc=True).execute()
    return result.data or []

@router.post("", response_model=dict, status_code=201)
async def connect_repo(
    request: RepoCreate,
    background_tasks: BackgroundTasks,
    profile: dict = Depends(get_user_profile),
):
    """Add a new GitHub repository to the workspace and trigger indexing."""
    owner, name = parse_github_url(request.github_url)
    repo_full_name = f"{owner}/{name}"

    if profile["id"] == "demo-user-001" or not is_real_mode():
        # Check if already exists in demo
        for r in DEMO_REPOS.values():
            if r["owner"].lower() == owner.lower() and r["name"].lower() == name.lower():
                raise HTTPException(status_code=400, detail="Repository already connected")

        repo_id = f"repo-{uuid.uuid4().hex[:8]}"
        new_repo = {
            "id": repo_id,
            "github_url": f"https://github.com/{repo_full_name}",
            "owner": owner,
            "name": name,
            "description": "Indexing repository...",
            "category": request.category,
            "tags": [request.category],
            "stars": 0,
            "last_indexed_at": None,
            "is_active": False,
        }
        DEMO_REPOS[repo_id] = new_repo
        background_tasks.add_task(simulate_indexing, repo_id, owner, name)
        return new_repo

    # Real mode
    supabase = get_supabase()
    # Check if repo already exists
    existing = supabase.table("repos").select("id").eq("github_url", f"https://github.com/{repo_full_name}").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Repository already connected")

    repo_id = str(uuid.uuid4())
    # Create database record
    res = supabase.table("repos").insert({
        "id": repo_id,
        "github_url": f"https://github.com/{repo_full_name}",
        "owner": owner,
        "name": name,
        "description": "Indexing in progress...",
        "category": request.category,
        "is_active": False,
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to register repository in database")

    background_tasks.add_task(run_real_indexing, repo_id, repo_full_name, request.category)
    return res.data[0]

@router.post("/{repo_id}/index", response_model=dict)
async def reindex_repo_route(
    repo_id: str,
    background_tasks: BackgroundTasks,
    profile: dict = Depends(get_user_profile),
):
    """Trigger manual re-indexing of a repository."""
    if profile["id"] == "demo-user-001" or not is_real_mode():
        if repo_id not in DEMO_REPOS:
            raise HTTPException(status_code=404, detail="Repository not found")
        DEMO_REPOS[repo_id].update({
            "is_active": False,
            "description": "Re-indexing in progress...",
        })
        repo = DEMO_REPOS[repo_id]
        background_tasks.add_task(simulate_indexing, repo_id, repo["owner"], repo["name"])
        return {"status": "indexing_triggered"}

    # Real mode
    supabase = get_supabase()
    result = supabase.table("repos").select("*").eq("id", repo_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Repository not found")

    repo = result.data
    supabase.table("repos").update({"is_active": False}).eq("id", repo_id).execute()

    repo_full_name = f"{repo['owner']}/{repo['name']}"
    background_tasks.add_task(run_real_indexing, repo_id, repo_full_name, repo["category"])
    return {"status": "indexing_triggered"}

@router.delete("/{repo_id}", response_model=dict)
async def delete_repo_route(
    repo_id: str,
    profile: dict = Depends(get_user_profile),
):
    """Remove a repository from the workspace."""
    if profile["id"] == "demo-user-001" or not is_real_mode():
        if repo_id not in DEMO_REPOS:
            raise HTTPException(status_code=404, detail="Repository not found")
        del DEMO_REPOS[repo_id]
        return {"status": "deleted"}

    # Real mode
    supabase = get_supabase()
    res = supabase.table("repos").delete().eq("id", repo_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {"status": "deleted"}
