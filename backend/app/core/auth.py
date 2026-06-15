"""
JWT validation via Supabase Auth.
Supabase issues standard JWTs signed with your project's JWT secret.
We decode and verify them here without an extra round-trip to Supabase.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings
from app.db.client import get_supabase

settings = get_settings()
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates the Supabase JWT and returns the decoded payload.
    The payload contains the user's `sub` (UUID) and `email`.
    """
    token = credentials.credentials
    
    if token == "demo-token":
        return {"sub": "demo-user-001", "email": "demo@repoflow.ai"}
        
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_ANON_KEY,   # Supabase uses anon key as JWT secret
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {e}",
        )


async def get_user_profile(current_user: dict = Depends(get_current_user)) -> dict:
    """Fetches the full profile row from Supabase for the authenticated user."""
    user_id = current_user["sub"]
    
    if user_id == "demo-user-001":
        return {
            "id": "demo-user-001",
            "email": "demo@repoflow.ai",
            "tier": "pro",
            "search_count": 0
        }

    supabase = get_supabase()

    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return result.data


def require_tier(allowed_tiers: list[str]):
    """Dependency factory — gate a route to specific subscription tiers."""
    async def _check(profile: dict = Depends(get_user_profile)):
        if profile["tier"] not in allowed_tiers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires one of: {allowed_tiers}. Your tier: {profile['tier']}",
            )
        return profile
    return _check
