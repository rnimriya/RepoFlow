import { ExternalLink, Copy, CheckCircle2 } from "lucide-react";

const FRONTEND_CODE = `// hooks/useFileUpload.ts — GLUE CODE
import { useState } from "react";

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File): Promise<string> {
    setUploading(true);
    try {
      // 1. Request a presigned URL from your backend
      const { upload_url, public_url } = await fetch(
        \`\${process.env.NEXT_PUBLIC_API_URL}/files/presign\`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
          }),
        }
      ).then((r) => r.json());

      // 2. Upload directly to S3 — no server middleman
      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return public_url;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading };
}`;

const BACKEND_CODE = `# routers/files.py — GLUE CODE
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import boto3, uuid

router = APIRouter(prefix="/files")
s3 = boto3.client("s3")

class PresignRequest(BaseModel):
    filename: str
    content_type: str

@router.post("/presign")
async def get_presign_url(body: PresignRequest):
    key = f"uploads/{uuid.uuid4()}/{body.filename}"
    
    # Generate a 5-minute presigned PUT URL
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": os.environ["S3_BUCKET"],
            "Key": key,
            "ContentType": body.content_type,
        },
        ExpiresIn=300,
    )
    public_url = (
        f"https://{os.environ['S3_BUCKET']}"
        f".s3.amazonaws.com/{key}"
    )
    return {"upload_url": upload_url, "public_url": public_url}`;

const SOURCES = [
  { repo: "vercel/next.js", file: "examples/with-s3/upload.ts", url: "#" },
  { repo: "tiangolo/fastapi", file: "docs/advanced/files.py", url: "#" },
];

const STEPS = [
  "Install boto3: pip install boto3",
  "Set S3_BUCKET env var in your backend .env",
  "Set NEXT_PUBLIC_API_URL in your frontend .env.local",
  "Use the useFileUpload() hook in your React component",
];

export function BlueprintDemo() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Live example</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            A real Integration Blueprint
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto text-base">
            Query: <span className="text-zinc-200 italic">"Link a React file upload component to an S3 presigned URL endpoint"</span>
          </p>
        </div>

        {/* Blueprint card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl shadow-black/40">

          {/* Title bar */}
          <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900">
            <div>
              <h3 className="font-semibold text-sm">Connect React File Upload → AWS S3 Presigned URL</h3>
              <p className="text-xs text-zinc-500 mt-0.5">GPT-4o · 1.2s · 2,140 tokens</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Source-verified
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="border-b border-zinc-800 px-6 py-4 bg-zinc-950/30">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 font-semibold">Integration steps</p>
            <ol className="flex flex-col gap-2">
              {STEPS.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-zinc-300">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Code split */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {/* Frontend */}
            <div>
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-mono text-zinc-400">hooks/useFileUpload.ts</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto code-scroll bg-zinc-950/20">
                <code>{FRONTEND_CODE}</code>
              </pre>
            </div>

            {/* Backend */}
            <div>
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-zinc-400">routers/files.py</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto code-scroll bg-zinc-950/20">
                <code>{BACKEND_CODE}</code>
              </pre>
            </div>
          </div>

          {/* Sources */}
          <div className="border-t border-zinc-800 px-6 py-3 flex flex-wrap items-center gap-4 bg-zinc-900/80">
            <span className="text-xs text-zinc-600 font-medium">Sources:</span>
            {SOURCES.map((s) => (
              <a
                key={s.file}
                href={s.url}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="font-mono">{s.repo}</span>
                <span className="text-zinc-600">→</span>
                <span className="font-mono text-zinc-500">{s.file}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
