# ADR-0005 — MVP identity and authorization

- Status: Accepted
- Decision date: 2026-08-05

## Context

MVP cần tối giản vận hành cho đồ án và chưa có nhu cầu cộng tác nhiều người
trong một cửa hàng. Các role `MANAGER`, `EDITOR`, `VIEWER`, multi-store
switching và email invitation làm tăng đáng kể số luồng cần kiểm thử.

## Decision

- Một user chỉ được thuộc một store trong MVP.
- Store có một membership quản trị với role `OWNER`.
- Platform admin tạo user, store và membership `OWNER` trong một transaction.
- Không triển khai email invitation, store selector hay member management UI.
- Giữ `store_members` và membership boundary để có thể mở rộng nhiều user/multi-store sau MVP bằng ADR mới.

## Consequences

- Authenticated request resolve được duy nhất một trusted `storeId` từ membership.
- Không cần client gửi store selector trong MVP.
- Khi mở rộng cộng tác, phải bổ sung role matrix, invitation, audit và cross-tenant tests trước khi đổi schema.
