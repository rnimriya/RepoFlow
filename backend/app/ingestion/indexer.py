"""
GitHub Repo Indexer — Phase 1 of the RepoFlow AI pipeline.

Fetches code files from curated repos, chunks them, embeds them,
and upserts vectors into Pinecone with rich metadata.

Usage:
    python -m app.ingestion.indexer --repo owner/repo-name
    python -m app.ingestion.indexer --all   # index all active repos
"""
import asyncio
import hashlib
import logging
from dataclasses import dataclass

import httpx
from github import Github, GithubException
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.core.config import get_settings
from app.db.client import get_supabase
from app.rag.vectorstore import get_embeddings, get_pinecone_index

logger = logging.getLogger(__name__)
settings = get_settings()

# File types we care about — ignore assets, configs, lockfiles, etc.
SUPPORTED_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx",   # frontend
    ".py",                           # backend
    ".vue", ".svelte",               # other FE frameworks
}

MAX_FILE_SIZE_BYTES = 50_000  # skip very large files (generated code, etc.)

# Chunking config — keeps code context meaningful
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=200,
    separators=["\n\nclass ", "\n\ndef ", "\n\nasync def", "\nexport ", "\n\n", "\n", " "],
)


@dataclass
class CodeChunk:
    content: str
    repo_full_name: str
    file_path: str
    github_url: str
    language: str
    category: str
    chunk_index: int
    content_hash: str


async def index_repo(repo_full_name: str, category: str) -> int:
    """
    Indexes a single GitHub repository into Pinecone.

    Args:
        repo_full_name: e.g. "tiangolo/fastapi"
        category: one of backend | frontend | ui-library | auth | etc.

    Returns:
        Number of chunks indexed.
    """
    gh = Github(settings.GITHUB_TOKEN)
    supabase = get_supabase()

    try:
        repo = gh.get_repo(repo_full_name)
    except GithubException as e:
        logger.error(f"Failed to fetch repo {repo_full_name}: {e}")
        return 0

    logger.info(f"Indexing {repo_full_name} ({repo.stargazers_count} stars)...")

    # Upsert repo record
    supabase.table("repos").upsert({
        "github_url": repo.html_url,
        "owner": repo.owner.login,
        "name": repo.name,
        "description": repo.description,
        "category": category,
        "stars": repo.stargazers_count,
    }, on_conflict="github_url").execute()

    chunks: list[CodeChunk] = []

    # Walk the repo tree
    try:
        contents = repo.get_contents("")
        queue = list(contents)
        while queue:
            item = queue.pop(0)
            if item.type == "dir":
                queue.extend(repo.get_contents(item.path))
                continue

            ext = "." + item.name.rsplit(".", 1)[-1] if "." in item.name else ""
            if ext not in SUPPORTED_EXTENSIONS:
                continue
            if item.size > MAX_FILE_SIZE_BYTES:
                continue

            language = _ext_to_language(ext)
            raw_url = item.download_url
            github_url = item.html_url

            # Fetch raw content
            async with httpx.AsyncClient() as client:
                resp = await client.get(raw_url, timeout=10)
                if resp.status_code != 200:
                    continue
                content = resp.text

            # Chunk the file
            file_chunks = text_splitter.split_text(content)
            for i, chunk in enumerate(file_chunks):
                chunks.append(CodeChunk(
                    content=chunk,
                    repo_full_name=repo_full_name,
                    file_path=item.path,
                    github_url=github_url,
                    language=language,
                    category=category,
                    chunk_index=i,
                    content_hash=hashlib.sha256(chunk.encode()).hexdigest()[:16],
                ))

    except GithubException as e:
        logger.error(f"Error walking repo {repo_full_name}: {e}")

    if not chunks:
        logger.warning(f"No indexable chunks found in {repo_full_name}")
        return 0

    # Embed + upsert in batches of 100
    await _upsert_chunks(chunks)
    logger.info(f"Indexed {len(chunks)} chunks from {repo_full_name}")
    return len(chunks)


async def _upsert_chunks(chunks: list[CodeChunk], batch_size: int = 100) -> None:
    """Embeds chunks and upserts them into Pinecone."""
    embeddings = get_embeddings()
    index = get_pinecone_index()

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c.content for c in batch]

        vectors = embeddings.embed_documents(texts)

        upsert_payload = [
            {
                "id": f"{c.repo_full_name}/{c.file_path}#{c.chunk_index}",
                "values": vec,
                "metadata": {
                    "repo": c.repo_full_name,
                    "file_path": c.file_path,
                    "github_url": c.github_url,
                    "language": c.language,
                    "category": c.category,
                    "chunk_index": c.chunk_index,
                    "content": c.content[:1000],  # Pinecone metadata has size limits
                    "content_hash": c.content_hash,
                },
            }
            for c, vec in zip(batch, vectors)
        ]

        index.upsert(vectors=upsert_payload)
        logger.info(f"  Upserted batch {i // batch_size + 1} ({len(batch)} vectors)")


def _ext_to_language(ext: str) -> str:
    return {
        ".ts": "typescript", ".tsx": "tsx",
        ".js": "javascript", ".jsx": "jsx",
        ".py": "python",
        ".vue": "vue", ".svelte": "svelte",
    }.get(ext, "text")


# ── CLI entry point ───────────────────────────────────────────

CURATED_REPOS = [
    # Frontend
    ("shadcn-ui/ui", "ui-library"),
    ("cruip/tailwind-landing-page-template", "frontend"),
    ("steven-tey/novel", "frontend"),
    # Auth
    ("nextauthjs/next-auth", "auth"),
    ("supabase/supabase", "auth"),
    # Backend
    ("tiangolo/fastapi", "backend"),
    ("django/django", "backend"),
    ("encode/httpx", "backend"),
    # Fullstack
    ("vercel/next.js", "fullstack"),
    ("t3-oss/create-t3-app", "fullstack"),
]


async def index_all() -> None:
    for repo, category in CURATED_REPOS:
        await index_repo(repo, category)


if __name__ == "__main__":
    import sys
    if "--all" in sys.argv:
        asyncio.run(index_all())
    elif "--repo" in sys.argv:
        idx = sys.argv.index("--repo")
        repo_arg = sys.argv[idx + 1]
        category_arg = sys.argv[idx + 2] if len(sys.argv) > idx + 2 else "backend"
        asyncio.run(index_repo(repo_arg, category_arg))
    else:
        print("Usage: python -m app.ingestion.indexer --all")
        print("       python -m app.ingestion.indexer --repo owner/name category")
