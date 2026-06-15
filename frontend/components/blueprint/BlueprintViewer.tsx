"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Loader2, GitFork } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import type { SearchResponse } from "@/lib/types";

interface Props {
  result: SearchResponse | null;
  isLoading: boolean;
}

export function BlueprintViewer({ result, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <p className="text-sm">Retrieving relevant code and synthesizing blueprint...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-600">
        <GitFork className="w-10 h-10" />
        <p className="text-sm">Your Integration Blueprint will appear here.</p>
      </div>
    );
  }

  const { blueprint, ai_model, latency_ms } = result;

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="bg-zinc-800 px-2 py-0.5 rounded font-mono">{ai_model}</span>
          <span>{latency_ms}ms</span>
        </div>
        <h2 className="text-xl font-bold">{blueprint.title}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">{blueprint.summary}</p>
      </div>

      {/* Integration Steps */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
          Integration Steps
        </h3>
        <ol className="flex flex-col gap-2">
          {blueprint.integration_steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-full bg-violet-900 text-violet-300 text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="text-zinc-300 leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Frontend Glue Code */}
      <CodeBlock
        title="Frontend Glue Code"
        filename={blueprint.glue_frontend.filename}
        language={blueprint.glue_frontend.language}
        code={blueprint.glue_frontend.code}
        explanation={blueprint.glue_frontend.explanation}
      />

      {/* Backend Glue Code */}
      <CodeBlock
        title="Backend Glue Code"
        filename={blueprint.glue_backend.filename}
        language={blueprint.glue_backend.language}
        code={blueprint.glue_backend.code}
        explanation={blueprint.glue_backend.explanation}
      />

      {/* Environment Variables */}
      {blueprint.environment_variables.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
            Environment Variables
          </h3>
          <div className="flex flex-col gap-2">
            {blueprint.environment_variables.map((ev) => (
              <div key={ev.key} className="flex items-start gap-3 bg-zinc-900 rounded-lg px-4 py-3 border border-zinc-800">
                <code className="text-violet-300 text-xs font-mono shrink-0">{ev.key}</code>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-zinc-400">{ev.description}</span>
                  {ev.example && (
                    <span className="text-xs text-zinc-600 font-mono">e.g. {ev.example}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
          Sources
        </h3>
        <div className="flex flex-col gap-2">
          {blueprint.sources.map((src, i) => (
            <a
              key={i}
              href={src.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-violet-400 transition-colors group"
            >
              <ExternalLink className="w-3 h-3 shrink-0 group-hover:text-violet-400" />
              <span className="font-mono">{src.repo}</span>
              <span className="text-zinc-600">→</span>
              <span className="font-mono text-zinc-500 group-hover:text-violet-300">
                {src.file_path}
                {src.lines ? `:${src.lines}` : ""}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {blueprint.warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-amber-400 mb-2">Heads up</h3>
          <ul className="flex flex-col gap-1">
            {blueprint.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-300/80">{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Code Block Sub-component ─────────────────────────────────

interface CodeBlockProps {
  title: string;
  filename: string;
  language: string;
  code: string;
  explanation: string;
}

function CodeBlock({ title, filename, language, code, explanation }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
          <span className="text-xs font-mono text-zinc-400">{filename}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-zinc-800 code-scroll">
        <SyntaxHighlighter
          language={language === "tsx" ? "typescript" : language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, fontSize: "12px", borderRadius: 0 }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{explanation}</p>
    </div>
  );
}
