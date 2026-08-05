# HomeHub Copilot Instructions

Read `/AGENTS.md` and `/DESIGN.md` before proposing or changing code. For planning,
also read `/docs/15-REQUIREMENTS-GAP-ANALYSIS.md` and
`/docs/16-IMPLEMENTATION-PLAN.md`.

Mandatory constraints:

- TypeScript strict.
- Next.js App Router in `apps/web`.
- NestJS modular monolith in `apps/api`.
- PostgreSQL through Prisma.
- REST `/api/v1` with OpenAPI.
- Shared-schema multitenancy; tenant-owned data is always scoped by trusted `store_id`.
- Never trust `storeId` from request payload.
- Never query a tenant-owned entity by ID without tenant scope.
- Controllers stay thin and do not call Prisma directly.
- Every tenant feature requires cross-tenant tests.
- Do not introduce payments/orders/shipping in MVP.
- Do not invent metrics, testimonials, colors, fonts or arbitrary per-store CSS.
- UI must cover loading/empty/error/success and the eight interaction states in `DESIGN.md`.
- Do not add microservices, GraphQL, CQRS, Kubernetes, or new infrastructure without an accepted ADR.

Before coding, state the acceptance criteria and affected modules. After coding, report actual test/lint/typecheck results and unresolved issues.
