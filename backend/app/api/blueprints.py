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

DEMO_BLUEPRINTS = {}


def get_mock_blueprint(query: str, blueprint_id: str) -> dict:
    query_lower = query.lower()
    
    title = "FastAPI JWT Authentication + Tailwind/React Login Form Integration"
    summary = f"Mock Blueprint generated for: '{query}'. Integrate a React/Tailwind frontend login page with a FastAPI backend endpoint utilizing JWT for authentication."
    integration_steps = [
        "Create a POST `/api/v1/auth/login` route in FastAPI accepting OAuth2 Password Request Form schema.",
        "Generate a JWT token upon successful user verification, signing it with the HS256 algorithm and a local secret key.",
        "Construct a form component in Tailwind/React that captures `username` and `password` and sends them via Fetch API to the backend.",
        "On a successful login response, store the JWT token in `localStorage` or `HttpOnly` cookie and update the application authentication state.",
        "Include the JWT token in the `Authorization: Bearer <token>` header for subsequent requests to secured endpoints."
    ]
    glue_frontend = {
        "language": "tsx",
        "filename": "components/LoginForm.tsx",
        "code": """import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Login</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-3 p-2 bg-zinc-800 text-white rounded border border-zinc-700" required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-4 p-2 bg-zinc-800 text-white rounded border border-zinc-700" required />
      <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded transition">Submit</button>
    </form>
  );
}""",
        "explanation": "Standard Next.js Form component using standard state variables to capture user inputs. It performs a URL-encoded POST request to the local FastAPI authentication server, stores the returned JWT token, and redirects to the dashboard."
    }
    glue_backend = {
        "language": "python",
        "filename": "app/api/auth.py",
        "code": """from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt

router = APIRouter(prefix="/auth")
SECRET_KEY = "your-dev-secret-key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # In a production app, verify password against hashed database records
    if form_data.username == "demo@repoflow.ai" and form_data.password == "password":
        expire = datetime.utcnow() + timedelta(minutes=30)
        token = jwt.encode({"sub": form_data.username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid username or password")""",
        "explanation": "FastAPI endpoint utilizing OAuth2PasswordRequestForm dependency for retrieving username/password and generating a signed JWT token."
    }
    environment_variables = [
        {"key": "JWT_SECRET_KEY", "description": "Secret key used to sign JWT tokens on the backend", "example": "your-super-secret-key-change-in-prod"}
    ]
    sources = [
        {
            "label": "User Auth Router",
            "repo": "rnimriya/RepoFlow",
            "file_path": "backend/app/api/auth.py",
            "github_url": "https://github.com/rnimriya/RepoFlow/blob/main/backend/app/api/auth.py",
            "lines": "1-20"
        }
    ]

    if "s3" in query_lower or "upload" in query_lower:
        title = "React S3 Presigned URL File Upload Integration"
        summary = f"Mock Blueprint generated for: '{query}'. Set up a React frontend to request an S3 presigned URL from FastAPI and upload a file directly to Amazon S3."
        integration_steps = [
            "Implement a GET `/api/v1/s3/presigned-url` route in FastAPI using `boto3` to generate a presigned PUT URL.",
            "Set up a file input handler in React/Next.js to trigger a call to the backend presigned URL endpoint.",
            "Perform a HTTP PUT request from the frontend directly to the S3 presigned URL with the binary file payload.",
            "Ensure AWS S3 bucket CORS configuration permits PUT requests from `http://localhost:3000`."
        ]
        glue_frontend = {
            "language": "tsx",
            "filename": "components/FileUpload.tsx",
            "code": """import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get presigned URL
      const res = await fetch(`http://localhost:8000/api/v1/s3/presigned-url?filename=${file.name}`);
      const { url } = await res.json();

      // 2. Upload directly to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      alert('Uploaded successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4 text-white" />
      <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded">
        {uploading ? 'Uploading...' : 'Upload to S3'}
      </button>
    </div>
  );
}""",
            "explanation": "React upload handler that fetches a presigned upload URL from the FastAPI API, then sends a PUT request with the file's binary data directly to AWS S3."
        }
        glue_backend = {
            "language": "python",
            "filename": "app/api/s3.py",
            "code": """import boto3
from fastapi import APIRouter, Query

router = APIRouter(prefix="/s3")
s3_client = boto3.client("s3")
BUCKET_NAME = "my-repoflow-uploads"

@router.get("/presigned-url")
async def get_presigned_url(filename: str = Query(...)):
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": BUCKET_NAME, "Key": filename},
        ExpiresIn=3600,
    )
    return {"url": url}""",
            "explanation": "FastAPI endpoint using the `boto3` SDK to generate a presigned PUT URL for secure, direct client-side file uploads to AWS S3."
        }
        environment_variables = [
            {"key": "AWS_ACCESS_KEY_ID", "description": "AWS Credentials ID", "example": "AKIAIOSFODNN7EXAMPLE"},
            {"key": "AWS_SECRET_ACCESS_KEY", "description": "AWS Credentials Secret Key", "example": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"}
        ]
        sources = [
            {
                "label": "S3 Router",
                "repo": "rnimriya/RepoFlow",
                "file_path": "backend/app/api/s3.py",
                "github_url": "https://github.com/rnimriya/RepoFlow/blob/main/backend/app/api/s3.py",
                "lines": "1-15"
            }
        ]

    elif "django" in query_lower or "table" in query_lower or "data" in query_lower:
        title = "Next.js Data Table + Django REST Paginated API Integration"
        summary = f"Mock Blueprint generated for: '{query}'. Link a React/Next.js pagination-supported data table to a Django REST Framework API endpoint returning paginated results."
        integration_steps = [
            "Enable PageNumberPagination or LimitOffsetPagination in Django REST Framework settings/views.",
            "Create a paginated Next.js component using standard pagination controls (Previous, Next, Page Numbers).",
            "Fetch data from the Django API by passing `page` and `page_size` query parameters.",
            "Update table state dynamically on page change."
        ]
        glue_frontend = {
            "language": "tsx",
            "filename": "components/DataTable.tsx",
            "code": """import { useState, useEffect } from 'react';

export default function DataTable() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/data?page=${page}`)
      .then(res => res.json())
      .then(res => {
        setData(res.results);
        setTotal(res.count);
      });
  }, [page]);

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-white">
      <table className="w-full text-left mb-4">
        <thead>
          <tr><th className="pb-2">ID</th><th className="pb-2">Name</th></tr>
        </thead>
        <tbody>
          {data.map((item: any) => (
            <tr key={item.id} className="border-t border-zinc-800">
              <td className="py-2">{item.id}</td><td className="py-2">{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-50">Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-zinc-800 rounded">Next</button>
      </div>
    </div>
  );
}""",
            "explanation": "React pagination table fetching data based on active page state from a paginated API endpoint."
        }
        glue_backend = {
            "language": "python",
            "filename": "views.py",
            "code": """from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from .models import Item
from .serializers import ItemSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ItemListView(ListAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    pagination_class = StandardResultsSetPagination""",
            "explanation": "Django REST Framework View utilizing built-in class-based pagination to return structured count, next, previous, and results data."
        }
        environment_variables = []
        sources = [
            {
                "label": "Django Item ListView",
                "repo": "rnimriya/RepoFlow",
                "file_path": "backend/views.py",
                "github_url": "https://github.com/rnimriya/RepoFlow/blob/main/backend/views.py",
                "lines": "1-15"
            }
        ]

    return {
        "blueprint_id": blueprint_id,
        "blueprint": {
            "title": title,
            "summary": summary,
            "integration_steps": integration_steps,
            "glue_frontend": glue_frontend,
            "glue_backend": glue_backend,
            "environment_variables": environment_variables,
            "sources": sources,
            "warnings": ["This is a mock blueprint provided for RepoFlow AI demo/local testing mode."]
        },
        "ai_model": "mock-gpt-4o",
        "latency_ms": 125,
        "tokens_used": 0
    }


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

    # Demo Mode bypass
    if user_id == "demo-user-001":
        blueprint_id = str(uuid.uuid4())
        mock_data = get_mock_blueprint(request.query, blueprint_id)
        DEMO_BLUEPRINTS[blueprint_id] = mock_data
        return mock_data

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
    if profile["id"] == "demo-user-001":
        if blueprint_id in DEMO_BLUEPRINTS:
            return DEMO_BLUEPRINTS[blueprint_id]
        mock_data = get_mock_blueprint("Fallback query", blueprint_id)
        DEMO_BLUEPRINTS[blueprint_id] = mock_data
        return mock_data

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


@router.get("", response_model=list[dict])
async def list_blueprints(profile: dict = Depends(get_user_profile)):
    """List the current user's blueprint history (most recent first)."""
    if profile["id"] == "demo-user-001":
        history = []
        for bid, bdata in DEMO_BLUEPRINTS.items():
            query_str = "Demo query"
            if "generated for: '" in bdata["blueprint"]["summary"]:
                parts = bdata["blueprint"]["summary"].split("generated for: '")
                if len(parts) > 1:
                    query_str = parts[1].split("'")[0]
            history.append({
                "id": bid,
                "query": query_str,
                "ai_model": bdata["ai_model"],
                "tier_at_creation": "pro",
                "created_at": "2026-06-15T19:59:55+05:30"
            })
        return history

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

    if profile["id"] == "demo-user-001":
        return {"status": "ok"}

    supabase = get_supabase()
    supabase.table("blueprints").update({
        "rating": rating,
        "feedback": feedback,
    }).eq("id", blueprint_id).eq("user_id", profile["id"]).execute()

    return {"status": "ok"}
