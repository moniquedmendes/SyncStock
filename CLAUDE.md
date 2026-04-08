# CLAUDE.md — SyncStock

## Overview
SyncStock is an inventory management system with an ASP.NET Core backend and a Next.js frontend.
The current MVC application remains operational during the migration, while the Next frontend becomes the primary interface over time.

## Stack
- Backend: ASP.NET Core MVC / Web API on .NET 10
- Frontend: Next.js 16 + React 19 + TypeScript
- Database: SQL Server via Entity Framework Core 10
- Authentication: Server-side cookie authentication for the API and MVC flows
- Testing: xUnit for backend integration tests, Vitest + Testing Library for frontend unit tests
- CI: GitHub Actions

## Architecture
- Current MVC controllers and views continue to exist during the transition.
- New JSON endpoints live in the same ASP.NET Core app under `/api/*`.
- The Next frontend consumes only the API layer.
- MVC controllers and API controllers must converge on shared services and repositories as the integration evolves.

## Directory Structure
- `Controllers/`: existing MVC controllers
- `Views/`: existing Razor views
- `Contexts/`: Entity Framework DbContext
- `Models/`: entities
- `sync-stock-front/`: Next frontend
- `tests/SyncStock.Backend.Tests/`: backend integration test suite
- `.github/workflows/`: CI pipelines

## Layers & Responsibilities
- **MVC Controller:** serves existing Razor pages during migration
- **API Controller:** receives HTTP JSON requests, validates DTOs, calls services
- **Service:** owns business logic and orchestration
- **Repository:** encapsulates database access when service-level composition becomes necessary
- **Model/Entity:** persistence shape only

> NEVER access the database directly from a frontend component.
> NEVER keep business rules duplicated between MVC and API endpoints.

## Code Conventions
- Files: target max ~300 lines; refactor once exceeded
- Functions: target max ~30 lines; split orchestration from detail
- Names: English for code artifacts
- Comments: Portuguese only when explaining non-obvious decisions
- Commit format: conventional commits with detailed body
- Tests: write the contract first, then implement or refactor

## Environment Variables
- `ConnectionStrings__DefaultConnection`: SQL Server connection string
- `ASPNETCORE_ENVIRONMENT`: runtime environment
- `NEXT_PUBLIC_API_BASE_URL`: frontend API base URL when the frontend is not served from the same origin

## Testing Strategy
- Backend:
  - integration tests for MVC/API behavior and auth/session flows
  - stability burst tests for critical routes
  - test projects must exclude generated `bin/` and `obj/` artifacts to avoid recursive MVC manifest copies
- Frontend:
  - unit tests for state management and UI behavior
  - build validation on every CI run
- Future:
  - Playwright smoke coverage for auth, products, dashboard, and stock movement
  - response-time baselines for key API endpoints

## What NEVER to Do
- Never commit secrets or `.env` files
- Never merge with failing CI
- Never add new frontend mocks for flows that already have real backend coverage
- Never change the architecture without updating this document
- Never introduce a second backend service just to proxy MVC internally
- Never bypass server-side authorization checks
