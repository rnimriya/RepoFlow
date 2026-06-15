"""
Core RAG pipeline — orchestrates retrieval → prompt assembly → LLM synthesis.
This is the "brain" of RepoFlow AI.
"""
import json
import time
from pathlib import Path

# Guard optional heavy deps
try:
    from langchain_openai import ChatOpenAI as _ChatOpenAI
except ImportError:
    _ChatOpenAI = None  # type: ignore

try:
    from langchain_core.messages import HumanMessage, SystemMessage
except ImportError:
    HumanMessage = None  # type: ignore
    SystemMessage = None  # type: ignore

from app.core.config import get_settings
from app.db.models import Blueprint, SearchResponse
from app.rag.vectorstore import search_frontend, search_backend

settings = get_settings()

# Load system prompt safely
_SYSTEM_PROMPT_PATH = Path(__file__).parent.parent.parent / "prompts" / "blueprint_system.md"
try:
    SYSTEM_PROMPT = _SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
except Exception as e:
    import logging
    logging.warning(f"Could not load blueprint_system.md prompt file: {e}")
    SYSTEM_PROMPT = (
        "You are RepoFlow AI, an expert software integration engineer. "
        "Your purpose is to generate Integration Blueprints connecting a frontend UI component "
        "to a backend API endpoint. Always return a valid JSON object matching the requested schema."
    )


def _pick_model(tier: str) -> str:
    """Select AI model based on user's subscription tier."""
    if tier == "pro":
        return settings.OPENAI_CHAT_MODEL_PRO
    return settings.OPENAI_CHAT_MODEL_STARTER


def _format_snippets(matches: list[dict]) -> str:
    """Formats retrieved vector matches into a readable context block for the prompt."""
    blocks = []
    for i, match in enumerate(matches, 1):
        meta = match["metadata"]
        blocks.append(
            f"### Snippet {i} (relevance: {match['score']:.2f})\n"
            f"- **Repo**: {meta.get('repo', 'unknown')}\n"
            f"- **File**: `{meta.get('file_path', 'unknown')}`\n"
            f"- **GitHub**: {meta.get('github_url', '')}\n"
            f"- **Language**: {meta.get('language', 'unknown')}\n\n"
            f"```{meta.get('language', '')}\n{meta.get('content', '')}\n```"
        )
    return "\n\n".join(blocks)


def _build_human_message(
    query: str,
    frontend_matches: list[dict],
    backend_matches: list[dict],
    tier: str,
) -> str:
    """Assembles the full human-turn message with retrieved context."""
    return f"""<context>
<user_query>{query}</user_query>
<user_tier>{tier}</user_tier>

<frontend_snippets>
{_format_snippets(frontend_matches)}
</frontend_snippets>

<backend_snippets>
{_format_snippets(backend_matches)}
</backend_snippets>
</context>

Generate an Integration Blueprint as a JSON object matching the schema in your instructions.
Ensure all `sources` entries reference real GitHub URLs from the snippets above."""


async def generate_blueprint(
    query: str,
    user_id: str,
    tier: str,
    top_k: int = 5,
) -> tuple[Blueprint, str, int, int | None]:
    """
    Full RAG pipeline: retrieve → assemble → generate → parse.

    Returns:
        (blueprint, model_name, latency_ms, tokens_used)
    """
    start = time.monotonic()

    # Step 1: Parallel semantic search — frontend + backend
    frontend_matches, backend_matches = await _run_parallel_search(query, top_k)

    # Step 2: Select model based on tier
    model_name = _pick_model(tier)
    if _ChatOpenAI is None:
        raise RuntimeError("langchain-openai not installed. Run: pip install langchain-openai langchain-core")
    llm = _ChatOpenAI(
        model=model_name,
        temperature=0.2,          # low temp for deterministic code generation
        openai_api_key=settings.OPENAI_API_KEY,
        response_format={"type": "json_object"},  # enforces JSON output
    )

    # Step 3: Build prompt
    human_msg = _build_human_message(query, frontend_matches, backend_matches, tier)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),  # type: ignore[call-arg]
        HumanMessage(content=human_msg),       # type: ignore[call-arg]
    ]

    # Step 4: Call LLM
    response = await llm.ainvoke(messages)
    raw_json = response.content
    tokens_used = response.usage_metadata.get("total_tokens") if response.usage_metadata else None

    # Step 5: Parse + validate with Pydantic
    blueprint_dict = json.loads(raw_json)
    blueprint = Blueprint(**blueprint_dict)

    latency_ms = int((time.monotonic() - start) * 1000)
    return blueprint, model_name, latency_ms, tokens_used


async def _run_parallel_search(query: str, top_k: int) -> tuple[list[dict], list[dict]]:
    """Run frontend and backend searches concurrently."""
    import asyncio
    frontend_task = asyncio.create_task(search_frontend(query, top_k))
    backend_task = asyncio.create_task(search_backend(query, top_k))
    return await asyncio.gather(frontend_task, backend_task)
