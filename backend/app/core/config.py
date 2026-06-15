from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret"

    # OpenAI
    OPENAI_API_KEY: str = "sk-placeholder"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL_STARTER: str = "gpt-3.5-turbo"
    OPENAI_CHAT_MODEL_PRO: str = "gpt-4o"

    # Pinecone
    PINECONE_API_KEY: str = "pcsk-placeholder"
    PINECONE_INDEX_NAME: str = "repoflow-code"
    PINECONE_ENVIRONMENT: str = "us-east-1-aws"

    # Supabase
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder-service-role-key"

    # GitHub
    GITHUB_TOKEN: str = "ghp-placeholder"

    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_placeholder"
    STRIPE_WEBHOOK_SECRET: str = "whsec_placeholder"
    STRIPE_STARTER_PRICE_ID: str = ""
    STRIPE_PRO_PRICE_ID: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # Tier limits
    STARTER_SEARCH_LIMIT: int = 50
    PRO_SEARCH_LIMIT: int = 99999  # effectively unlimited


@lru_cache
def get_settings() -> Settings:
    return Settings()
