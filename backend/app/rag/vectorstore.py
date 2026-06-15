"""
Pinecone vector store wrapper.
Handles initialization and semantic search against the indexed code embeddings.
"""
from functools import lru_cache

# Guard heavy optional dependencies — server starts without them
try:
    from pinecone import Pinecone as _Pinecone
except ImportError:
    _Pinecone = None  # type: ignore

try:
    from langchain_openai import OpenAIEmbeddings as _OpenAIEmbeddings
except ImportError:
    _OpenAIEmbeddings = None  # type: ignore

from app.core.config import get_settings

settings = get_settings()


@lru_cache
def get_embeddings():
    if _OpenAIEmbeddings is None:
        raise RuntimeError("langchain-openai not installed. Run: pip install langchain-openai")
    return _OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        openai_api_key=settings.OPENAI_API_KEY,
    )


@lru_cache
def get_pinecone_index():
    if _Pinecone is None:
        raise RuntimeError("pinecone not installed. Run: pip install pinecone")
    pc = _Pinecone(api_key=settings.PINECONE_API_KEY)
    return pc.Index(settings.PINECONE_INDEX_NAME)


async def semantic_search(
    query: str,
    top_k: int = 5,
    filter: dict | None = None,
) -> list[dict]:
    """
    Embeds the query and runs a nearest-neighbor search in Pinecone.

    Args:
        query:   Natural language or code description to search for.
        top_k:   Number of results to return.
        filter:  Pinecone metadata filter, e.g. {"category": {"$eq": "frontend"}}

    Returns:
        List of match dicts with keys: id, score, metadata
    """
    embeddings = get_embeddings()
    index = get_pinecone_index()

    query_vector = embeddings.embed_query(query)

    response = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True,
        filter=filter,
    )

    return [
        {
            "id": match.id,
            "score": match.score,
            "metadata": match.metadata,  # includes: file_path, github_url, repo, language, content
        }
        for match in response.matches
    ]


async def search_frontend(query: str, top_k: int = 5) -> list[dict]:
    """Semantic search restricted to frontend code categories."""
    return await semantic_search(
        query=query,
        top_k=top_k,
        filter={"category": {"$in": ["frontend", "ui-library", "fullstack"]}},
    )


async def search_backend(query: str, top_k: int = 5) -> list[dict]:
    """Semantic search restricted to backend code categories."""
    return await semantic_search(
        query=query,
        top_k=top_k,
        filter={"category": {"$in": ["backend", "api", "auth", "database", "fullstack"]}},
    )
