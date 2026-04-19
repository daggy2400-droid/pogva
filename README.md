# Samson Fashion

Premium Ethiopian Footwear — full-stack e-commerce app.

## Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, TypeScript
- **Backend**: Go (Gin), PostgreSQL (Nhost), WebSocket
- **Deploy**: Render (backend + frontend) or Netlify (frontend)

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
go run ./cmd/api
```

### Frontend
```bash
cd frontend
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

### Docker (full stack)
```bash
# Edit DATABASE_URL in docker-compose.yml first
docker compose up --build
```

## Deploy

See `render.yaml` for one-click Render deployment.  
See `netlify.toml` for Netlify frontend deployment.

> Set `DATABASE_URL` to your Nhost PostgreSQL connection string in all deployment configs.
