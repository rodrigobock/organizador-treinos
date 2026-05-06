# Docker Setup Guide

This project includes Docker configuration for both local development and production deployment.

## Local Development with Docker Compose

### Prerequisites
- Docker Desktop installed and running
- `docker` and `docker-compose` commands available

### Quick Start

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL database on `localhost:5432`
   - Build and run the backend on `localhost:8080`
   - Build and run the frontend on `localhost:3000`
   - Apply database migrations automatically

2. **Stop services**:
   ```bash
   docker-compose down
   ```

3. **Remove volumes (reset database)**:
   ```bash
   docker-compose down -v
   ```

### Individual Services

**Start only database + backend** (frontend runs locally with `npm start`):
```bash
docker-compose up db backend
```

**View logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f db
```

**Access PostgreSQL directly**:
```bash
docker-compose exec db psql -U postgres -d organizador_treinos
```

## Environment Configuration

### Local Development (.env)
Create a `.env` file in the project root (copy from `.env.example`):
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=organizador_treinos
QUARKUS_PROFILE=dev
REACT_APP_API_URL=http://localhost:8080
```

### Backend Configuration
- **Default profile**: `application.properties` (production defaults)
- **Dev profile**: `application-dev.properties` (docker-compose overrides)
  - Activates with `QUARKUS_PROFILE=dev`
  - Connects to `db` service (docker-compose hostname)
  - Enables SQL logging and DEBUG level
  - Expands CORS origins for local dev

## Production Deployment (Render.com)

### Build the Docker Image
```bash
cd organizador-treinos-back-end
docker build -t organizador-treinos-backend:latest .
```

### Run the Image Locally (test)
```bash
docker run -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host.docker.internal:5432/organizador_treinos \
           -e QUARKUS_DATASOURCE_USERNAME=postgres \
           -e QUARKUS_DATASOURCE_PASSWORD=postgres \
           -p 8080:8080 \
           organizador-treinos-backend:latest
```

### Deploy to Render

1. Push the code to GitHub
2. In Render dashboard, create a **Web Service**:
   - **Repository**: Select your GitHub repo
   - **Runtime**: Docker
   - **Build Command**: (auto-detected from Dockerfile)
   - **Start Command**: (auto-detected, runs jar)

3. Set environment variables in Render:
   ```
   DB_URL=jdbc:postgresql://db.XXXX.supabase.co:5432/postgres?sslmode=require
   DB_USERNAME=postgres
   DB_PASSWORD=<supabase-password>
   CORS_ORIGINS=https://your-app.vercel.app
   JWT_PRIVATE_KEY=<full PEM content of privateKey.pem>
   JWT_PUBLIC_KEY=<full PEM content of publicKey.pem>
   ```

### JWT Keys on Render
The `docker-entrypoint.sh` writes `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` env vars to files at startup. In Render's dashboard you can paste multi-line PEM content directly into env var fields.

### Supabase
The `?sslmode=require` at the end of `DB_URL` is mandatory for Supabase connections.

### Important Notes
- Render assigns a dynamic port (`PORT` env var, usually `10000`) — the app picks it up automatically
- `PORT` is set by Render; leave it unset in your own env vars

## Development Tips

### Watch Frontend Changes
When running `docker-compose up`, the frontend service mounts source volumes, so hot-reload works:
```bash
docker-compose up frontend
```

### Rebuild After Code Changes
```bash
# Rebuild all services
docker-compose up --build

# Rebuild only backend
docker-compose build backend
docker-compose up backend
```

### Debug Backend in Docker
Check logs:
```bash
docker-compose logs -f backend
```

Database state:
```bash
docker-compose exec db psql -U postgres -d organizador_treinos -c "SELECT * FROM workout;"
```

### Clean Start (Reset Database)
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build  # Rebuild and run
```

## Troubleshooting

### Backend fails to start: "Cannot connect to database"
- Ensure PostgreSQL is healthy: `docker-compose logs db`
- Check the healthcheck: `docker-compose ps` (should show `db (healthy)`)
- Force restart: `docker-compose restart db backend`

### Port already in use
- Change ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "5433:5432"  # PostgreSQL
    - "8081:8080"  # Backend
    - "3001:3000"  # Frontend
  ```

### Rebuild stale image
```bash
docker-compose build --no-cache backend
docker-compose up backend
```

### Check environment variables
```bash
docker-compose exec backend env | grep QUARKUS
```

## Multi-Stage Build (Dockerfile)

The backend Dockerfile uses multi-stage building:
1. **Stage 1 (builder)**: Maven + JDK 17, compiles the app
2. **Stage 2 (runtime)**: Alpine JRE 17, runs the compiled app

This keeps the final image small (~200MB vs 800MB for a full Maven image).

## Next Steps

- For frontend-only local development: run `npm start` locally while backend is in Docker
- For full local development: use `docker-compose up --build`
- For production: follow the Render deployment steps above
