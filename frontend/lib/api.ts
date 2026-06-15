import { createClient } from "@supabase/supabase-js";
import type { SearchResponse } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function getAuthToken(): Promise<string> {
  if (typeof window !== "undefined" && localStorage.getItem("repoflow_demo_mode") === "true") {
    return "demo-token";
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error("You must be logged in to generate a Blueprint.");
  }
  return data.session.access_token;
}

/** Core function — sends query to the RAG pipeline and returns a Blueprint. */
export async function generateBlueprint(query: string): Promise<SearchResponse> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/blueprints/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, top_k: 5 }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error ${res.status}`);
  }

  return res.json() as Promise<SearchResponse>;
}

/** Fetch a previously generated Blueprint by ID. */
export async function getBlueprint(id: string): Promise<SearchResponse> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/blueprints/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Blueprint not found");
  return res.json();
}

/** List the user's blueprint history. */
export async function listBlueprints(): Promise<
  { id: string; query: string; ai_model: string; created_at: string }[]
> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/blueprints/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch blueprint history");
  return res.json();
}
