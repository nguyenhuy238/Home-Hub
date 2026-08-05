# ADR-0004 — REST API with OpenAPI

- Status: Accepted

## Context

Web hiện là client chính nhưng có khả năng mở rộng mobile/integration. Cần contract dễ đọc, test và sinh client.

## Decision

Dùng REST JSON với prefix `/api/v1` và OpenAPI là contract chính thức.

## Consequences

- Dễ debug và tích hợp.
- Có thể sinh TypeScript client.
- Cần quản lý versioning và consistency của response/error.

## Guardrails

- Endpoint mới phải được document.
- Breaking change cần version/transition plan.
- Không tạo endpoint hành động tùy tiện khi resource semantics đủ dùng.
