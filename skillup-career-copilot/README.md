# SkillUp – AI Career Copilot

> An AI-powered career assistant for students and early-career engineers — covering profile analysis, skill gap detection, live mock interviews, and career roadmap planning.

## ✨ Features

| Feature | Technology |
|---|---|
| **GitHub Profile Analyzer** | GitHub REST API + Recharts (Pie & Bar charts) |
| **Skill Gap Analyzer** | Pinecone Vector DB + semantic role-skill matching |
| **AI Interview Coach** | OpenAI GPT-4o-mini streaming + real-time scoring |
| **Career Roadmap Planner** | Static curated paths (Frontend / Backend / ML / Full Stack) |

---

## 🏗 Project Structure

```
skillup-career-copilot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/route.ts       ← GitHub REST API proxy
│   │   │   ├── interview/route.ts    ← OpenAI streaming SSE endpoint
│   │   │   └── skills/route.ts       ← Skill gap analysis endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  ← Main SPA shell (4 tabs)
│   ├── components/
│   │   ├── GitHubAnalyzer.tsx        ← GitHub profile + language charts
│   │   ├── SkillGapAnalyzer.tsx      ← Skill gap radar + breakdown
│   │   ├── InterviewCoach.tsx        ← Streaming AI chat + score bar
│   │   ├── CareerRoadmap.tsx         ← Milestone roadmap with charts
│   │   └── ui/
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       └── progress.tsx
│   └── lib/
│       ├── github.ts                 ← GitHub API client + helpers
│       ├── pinecone.ts               ← Pinecone client (server-only)
│       ├── skills-data.ts            ← Static role→skill maps (shared)
│       └── utils.ts                  ← cn(), formatDate(), formatNumber()
└── .env.example                      ← Environment variable template
```

---

## 🚀 Getting Started

### 1. Clone and install dependencies

```bash
cd skillup-career-copilot
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=skillup-skills
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Minimum required:** Only `OPENAI_API_KEY` is needed to use the Interview Coach. The GitHub Analyzer works without a token (but rate-limited to 60 req/hr). Pinecone is optional — the Skill Gap Analyzer uses static data as a fallback.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔌 API Routes

### `GET /api/github?username={username}`

Fetches public GitHub profile and repository data. Returns:
- User profile (name, bio, avatar, followers, location)
- All public repos (sorted by `updated_at`)
- Language statistics with percentages and hex colors

**Auth:** Uses `GITHUB_TOKEN` env var (optional, increases rate limit to 5,000 req/hr).

---

### `POST /api/interview`

Streams a live mock interview session via Server-Sent Events (SSE).

**Request body:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "role": "Frontend Engineer",
  "level": "mid"
}
```

**Stream format:** `data: {"delta": "..."}\n\n` — append each delta to build the full response. The final message contains a JSON metadata block: `{"score": 82, "feedback_summary": "...", "next_question_type": "system-design"}`.

**Auth:** Requires `OPENAI_API_KEY`. Returns `503` if missing.

---

### `POST /api/skills`

Performs weighted skill gap analysis against a target role.

**Request body:**
```json
{
  "userSkills": ["React", "TypeScript", "Node.js"],
  "targetRole": "Frontend Engineer"
}
```

**Response:**
```json
{
  "role": "Frontend Engineer",
  "gapScore": 74,
  "coveredCount": 5,
  "totalCount": 8,
  "required": [
    { "skill": "React", "category": "Framework", "importance": "critical", "hasSkill": true },
    ...
  ]
}
```

Scoring weights: critical skills 60%, important 30%, nice-to-have 10%.

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Optional | GitHub personal access token (scopes: `public_repo`) |
| `OPENAI_API_KEY` | Required for AI interview | OpenAI API key |
| `PINECONE_API_KEY` | Optional | Pinecone vector database API key |
| `PINECONE_ENVIRONMENT` | Optional | Pinecone environment (e.g. `us-east-1-aws`) |
| `PINECONE_INDEX_NAME` | Optional | Pinecone index name (default: `skillup-skills`) |
| `NEXT_PUBLIC_APP_URL` | Optional | App base URL for absolute references |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts (Pie, Bar, Radar)
- **AI:** OpenAI SDK (`gpt-4o-mini`, streaming SSE)
- **Vector DB:** Pinecone (`@pinecone-database/pinecone`)
- **Icons:** Lucide React
- **Utilities:** clsx + tailwind-merge

---

## 📦 Build & Deploy

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

Deploy to [Vercel](https://vercel.com) with one click — set the environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.
