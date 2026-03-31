# CosmosHub

A NASA data explorer with a classified mission terminal aesthetic. Built with React + Express, uses real NASA APIs, and Claude AI for contextual analysis on each module.

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-VISIT-FF8C00?style=for-the-badge)](https://cosmos-hub-two.vercel.app/)
[![Backend API](https://img.shields.io/badge/BACKEND_API-RENDER-555?style=for-the-badge)](https://cosmos-hub.onrender.com/health)

---

## What it does

Four modules, each pulling live data from NASA's open APIs:

- **APOD** — browse the astronomy picture of the day, pick a date, or page through a date range gallery. Claude writes a short analysis for each image in Carl Sagan's voice
- **NeoWs** — near Earth asteroid tracker. Shows a bar chart of approach distances and a canvas proximity map I built from scratch. Claude generates a threat briefing styled after PDCO reports
- **Mars** — photo gallery from Curiosity, Perseverance, Spirit and Opportunity. Filter by sol and camera. Claude describes the scene based on the rover and instrument
- **EPIC** — full-disc Earth imagery from the DSCOVR satellite at L1

A few things I'm fairly happy with: the canvas asteroid map (it's Earth centred and roughly scale accurate), the server side caching to avoid hammering NASA's rate limits, and a separate rate limiter on the AI routes to keep API costs from blowing up.

---

## Stack

- **Frontend** — React 18, React Router, Vite, Tailwind, Recharts, Axios
- **Backend** — Node/Express, NodeCache, Helmet, express rate limit
- **AI** — Anthropic Claude (claude-sonnet-4-6)
- **Testing** — Jest + Supertest (backend), Vitest + React Testing Library (frontend)
- **Deployed** — Vercel (frontend) + Render (backend)

---

## Running locally

You'll need Node ≥ 18, a [NASA API key](https://api.nasa.gov/) (DEMO_KEY works but is rate limited), and an [Anthropic API key](https://console.anthropic.com/) for the AI features.

```bash
git clone https://github.com/<your-username>/cosmos-hub.git
cd cosmos-hub
```

**Backend:**

```bash
cd backend
npm install
cp .env.example .env   # fill in your keys
npm run dev            # port 5000
```

**Frontend:**

```bash
cd ../frontend
npm install
npm run dev            # port 5173, proxies /api/* to localhost:5000
```

**Tests:**

```bash
cd backend && npm test
cd frontend && npm test
```

---

## Environment variables

**`backend/.env`**

```
NASA_API_KEY=           # required
ANTHROPIC_API_KEY=      # required
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`** (optional, defaults to Vite proxy in dev)

```
VITE_API_URL=https://your-render-app.onrender.com/api
```

---

## API endpoints

| Method | Path                        | Params                                |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/health`                   | —                                     |
| GET    | `/api/apod`                 | `date`, `start_date`, `end_date`      |
| GET    | `/api/asteroids`            | `start_date`, `end_date` (max 7 days) |
| GET    | `/api/mars/photos`          | `rover`, `sol`, `camera`, `page`      |
| GET    | `/api/mars/rovers`          | —                                     |
| GET    | `/api/epic`                 | `date`                                |
| GET    | `/api/epic/dates`           | —                                     |
| POST   | `/api/ai/apod`              | `{ title, explanation, date }`        |
| POST   | `/api/ai/asteroid-briefing` | `{ asteroids[], dateRange }`          |
| POST   | `/api/ai/mars-scene`        | `{ roverName, cameraFullName, sol }`  |

---

## Deploying

**Backend → Render:** connect repo, set root directory to `backend`, build `npm install`, start `npm start`, add the four env vars.

**Frontend → Vercel:** import repo, root directory `frontend`, add `VITE_API_URL` pointing to your Render URL.

---

_Uses [NASA Open APIs](https://api.nasa.gov/). Not affiliated with NASA._
