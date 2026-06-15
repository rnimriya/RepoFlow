# RepoFlow AI

> Generate "Integration Blueprints" — the exact glue code to connect your frontend UI to a backend architecture.

## Project Structure

```
repoflow-ai/
├── backend/              # FastAPI + LangChain RAG pipeline
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, auth, rate limiting
│   │   ├── ingestion/    # GitHub repo indexing + vectorization
│   │   ├── rag/          # RAG pipeline, prompt engineering
│   │   └── db/           # Supabase client, models
│   ├── prompts/          # System prompts for Blueprint generation
│   └── requirements.txt
├── frontend/             # Next.js 14 + Tailwind dashboard
│   ├── app/
│   ├── components/
│   └── package.json
├── infra/
│   ├── schema.sql        # Supabase PostgreSQL schema
│   └── github-actions/   # CI/CD workflows
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- OpenAI API key
- Pinecone account

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## SaaS Tiers

| Feature | Starter ($5/mo) | Pro ($10/mo) |
|---|---|---|
| Search Limit | 50/mo | Unlimited |
| Context | Single-file snippets | Cross-file Blueprints |
| Interface | Web Dashboard | Web + VS Code Extension |
| AI Model | Standard | GPT-4o / Claude 3.5 Sonnet |
| Export | Copy to Clipboard | Push to Repo / PR creation |

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, LangChain, Python 3.11
- **Vector DB**: Pinecone
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel (frontend), AWS Lambda / Cloud Run (backend)
- **CI/CD**: GitHub Actions
