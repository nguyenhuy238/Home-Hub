# ADR-0001 — TypeScript stack

- Status: Accepted
- Decision date: Initial project setup

## Context

Dự án có web public, admin, API, nhiều model dữ liệu và yêu cầu bảo trì/mở rộng. Một ngôn ngữ xuyên frontend/backend giúp giảm context switching.

## Decision

Sử dụng TypeScript strict với Next.js cho web và NestJS cho API; PostgreSQL + Prisma cho persistence.

## Consequences

### Positive

- Type safety xuyên hệ thống.
- IDE/refactor tốt.
- Next.js phù hợp SEO/SSR.
- NestJS cung cấp module, DI, guard và OpenAPI.

### Negative

- Cần quản lý type giữa API và frontend đúng contract.
- Build/tooling phức tạp hơn JavaScript thuần.

## Guardrails

- Không chia sẻ Prisma model trực tiếp sang frontend.
- API contract qua OpenAPI/client generation.
- Pin version trong lockfile; nâng cấp có kế hoạch.
