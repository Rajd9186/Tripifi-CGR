# Tripifi CGR Backend

FastAPI + PostgreSQL backbone for Tripifi CGR. The Next.js frontend keeps working
with demo providers when no backend is configured.

## Quickstart (local)

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt

# Database (option A: docker)
docker compose up -d postgres

# Migrations + seed
alembic upgrade head
DATABASE_URL="postgresql+psycopg://tripifi:tripifi@localhost:5432/tripifi" python seed.py

# Run API
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Frontend integration

```bash
# in project root
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run dev
```

Without `NEXT_PUBLIC_API_URL`, the frontend `src/lib/api/*` client serves
clearly-marked demo data (`is_demo: true`) and the UI is unchanged.

## Tests

```bash
cd backend
pytest
```

## Deployment model

```
Internet → CDN/HTTPS → Next.js + FastAPI → PostgreSQL → External providers
```

Secrets stay server-side in environment variables. Never commit `.env`.
Demo providers (`app/providers/demo.py`) simulate inventory and payments;
production providers plug into `app/providers/base.py` protocols.
