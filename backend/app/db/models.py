"""
Pydantic models that mirror the Supabase schema.
Used for request/response validation throughout the API.
"""
from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, HttpUrl


# ── Profiles ─────────────────────────────────────────────────

class Profile(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    tier: str = "free"
    search_count: int = 0
    search_reset_at: datetime
    created_at: datetime


# ── Repos & Indexed Files ─────────────────────────────────────

class Repo(BaseModel):
    id: str
    github_url: str
    owner: str
    name: str
    description: str | None = None
    category: str
    tags: list[str] = []
    stars: int = 0
    last_indexed_at: datetime | None = None
    is_active: bool = True


class IndexedFile(BaseModel):
    id: str
    repo_id: str
    file_path: str
    github_url: str
    language: str | None = None
    pinecone_id: str | None = None


# ── Blueprint ─────────────────────────────────────────────────

class BlueprintSource(BaseModel):
    label: str
    repo: str
    file_path: str
    github_url: str
    lines: str | None = None


class GlueCode(BaseModel):
    language: str
    filename: str
    code: str
    explanation: str


class Blueprint(BaseModel):
    title: str
    summary: str
    integration_steps: list[str]
    glue_frontend: GlueCode
    glue_backend: GlueCode
    environment_variables: list[dict[str, str]] = []
    sources: list[BlueprintSource]
    warnings: list[str] = []


# ── API Request / Response ────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5  # number of RAG results per side (frontend + backend)


class SearchResponse(BaseModel):
    blueprint_id: str
    blueprint: Blueprint
    ai_model: str
    latency_ms: int
    tokens_used: int | None = None
