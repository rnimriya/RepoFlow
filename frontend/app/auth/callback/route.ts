/**
 * Supabase Auth callback handler.
 * Uses a client-side page to exchange the PKCE code for a session,
 * since the code_verifier is stored in browser cookies (not available server-side).
 */
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";

  // Redirect to the client-side exchange page, forwarding all params
  const clientUrl = new URL(`${origin}/auth/confirm`);
  searchParams.forEach((value, key) => clientUrl.searchParams.set(key, value));
  clientUrl.searchParams.set("next", next);

  return NextResponse.redirect(clientUrl.toString());
}
