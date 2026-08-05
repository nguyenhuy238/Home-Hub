# ADR-0003 — Shared-schema multitenancy

- Status: Accepted

## Context

MVP cần hỗ trợ nhiều cửa hàng nhưng quy mô ban đầu nhỏ. Database-per-tenant làm provisioning, migration và vận hành phức tạp.

## Decision

Dùng một PostgreSQL database và shared schema. Tenant-owned rows có `store_id`.

## Consequences

### Positive

- Đơn giản triển khai và migration.
- Chi phí thấp.
- Dễ báo cáo platform-level.

### Risks

- Lỗi query có thể gây leak cross-tenant.

### Mitigations

- Trusted tenant context.
- Repository scoping.
- Compound unique/index.
- Cross-tenant tests bắt buộc.
- Có thể bổ sung PostgreSQL RLS ở giai đoạn hardening.
