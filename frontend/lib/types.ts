// Mirror of backend/app/db/models.py

export interface BlueprintSource {
  label: string;
  repo: string;
  file_path: string;
  github_url: string;
  lines?: string;
}

export interface GlueCode {
  language: string;
  filename: string;
  code: string;
  explanation: string;
}

export interface Blueprint {
  title: string;
  summary: string;
  integration_steps: string[];
  glue_frontend: GlueCode;
  glue_backend: GlueCode;
  environment_variables: { key: string; description: string; example?: string }[];
  sources: BlueprintSource[];
  warnings: string[];
}

export interface SearchResponse {
  blueprint_id: string;
  blueprint: Blueprint;
  ai_model: string;
  latency_ms: number;
  tokens_used?: number;
}

export interface Repo {
  id: string;
  github_url: string;
  owner: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  stars: number;
  last_indexed_at: string | null;
  is_active: boolean;
}

