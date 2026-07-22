# Jaimin Panchal — Developer Portfolio Platform

A full-stack, admin-managed developer portfolio: a cinematic public site (Next.js) backed by
a Spring Boot API with JWT-secured content management, AI job matching, ATS tooling, and a
meeting scheduler.

Built and maintained by **Jaimin Panchal**.

## Highlights

- **Noir/champagne design system** — Fraunces + Plus Jakarta Sans, one warm accent on a
  near-black stage; documented in [docs/DESIGN.md](docs/DESIGN.md)
- **Persistent 3D scene** — a single React Three Fiber canvas whose composition morphs with
  scroll (GSAP ScrollTrigger synced to Lenis smooth scroll); desktop-only, honors
  `prefers-reduced-motion`, pauses off-range
- **Interactive skills constellation** — SVG orbit map, node size = proficiency (no progress bars)
- **Project case studies** — problem / solution / architecture / challenges / learnings /
  metrics per project at `/projects/[id]`, editable from the admin panel with drag-and-drop ordering
- **Live GitHub showcase** — server-fetched stats, language distribution, top repositories
  (1-hour revalidation)
- **Admin panel** — JWT auth; manage profile, projects, skills, experience, education,
  certificates, inquiries, resume (ATS analysis), and AI job recommendations with generated
  cover letters / recruiter emails
- **Contact + scheduling** — validated form with honeypot & time-trap spam protection,
  email notifications, auto-generated meeting links

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| Motion/3D | Framer Motion 12, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei |
| Backend | Spring Boot 3 (Java), Spring Security (JWT), JPA/Hibernate, PostgreSQL |
| Integrations | GitHub REST, Adzuna jobs, SMTP mail, Apache PDFBox |

## Running locally

### Backend

```bash
cd backend/portfolio-backend
# Required environment (never commit values):
#   SPRING_DATASOURCE_URL      jdbc:postgresql://localhost:5432/portfolio_db
#   SPRING_DATASOURCE_USERNAME / SPRING_DATASOURCE_PASSWORD
#   SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD   (SMTP app credentials)
#   ADZUNA_APP_ID / ADZUNA_APP_KEY                (job search, optional)
#   MEET_LINK                                     (fallback meeting URL, optional)
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
# Optional environment:
#   NEXT_PUBLIC_BACKEND_URL   http://localhost:8080   (default)
#   NEXT_PUBLIC_SITE_URL      https://your-domain.com (metadata base)
#   GITHUB_TOKEN              raises GitHub API rate limits (server-side only)
npm run dev
```

The public site renders a graceful static fallback when the backend is unreachable.

## Deploying

- **Frontend:** Vercel (or any Node host). Set `NEXT_PUBLIC_BACKEND_URL`,
  `NEXT_PUBLIC_SITE_URL`, and optionally `GITHUB_TOKEN`. `npm run build` must pass with
  zero warnings — it does on `main`.
- **Backend:** any JVM host (Railway/Render/Fly/EC2) with PostgreSQL. Supply the
  environment variables above; schema is managed by JPA (`ddl-auto=update`).
- **CORS:** allow the frontend origin in `CorsConfig`.

## Repository layout

```
frontend/   Next.js app (public site + /admin panel)
backend/    Spring Boot API
docs/       AUDIT.md · DESIGN.md · QA.md
docker/     container setup
```

## Quality gates

`npx tsc --noEmit`, `npx eslint .` (zero errors/warnings) and `npm run build` are the
merge bar for the frontend; `./mvnw compile` for the backend. See
[docs/QA.md](docs/QA.md) for the release checklist and reports.
