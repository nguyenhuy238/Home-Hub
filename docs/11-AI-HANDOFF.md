# 11 — AI Handoff Guide

## 1. Mục đích

Tài liệu này giúp giao dự án cho AI coding agent mà không để agent tự thay đổi phạm vi, kiến trúc hoặc bỏ qua multi-tenant/security.

## 2. Prompt khởi đầu đề xuất

```text
Bạn đang phát triển dự án HomeHub. Trước khi viết code, hãy đọc AGENTS.md, DESIGN.md và toàn bộ tài liệu được liên kết trong đó. Không tự ý thay đổi stack hoặc kiến trúc. Hãy bắt đầu bằng task [TASK_ID] trong docs/10-ROADMAP-AND-BACKLOG.md hoặc docs/16-IMPLEMENTATION-PLAN.md.

Trước khi chỉnh sửa:
1. Tóm tắt acceptance criteria.
2. Nêu module/file dự kiến thay đổi.
3. Nêu rủi ro multi-tenant và security.

Sau khi chỉnh sửa:
1. Liệt kê file đã thay đổi.
2. Nêu migration/API contract thay đổi.
3. Báo kết quả lint/typecheck/test thực tế.
4. Nêu phần chưa hoàn thành hoặc giả định.
```

## 3. Thứ tự handoff

Không giao AI “xây toàn bộ hệ thống” trong một prompt. Giao theo milestone và task nhỏ:

1. Foundation.
2. Database schema.
3. Auth.
4. Tenant context.
5. Một module CRUD hoàn chỉnh.
6. Storefront.
7. Leads.
8. Hardening.

Mỗi task nên có acceptance criteria và giới hạn file/module.

## 4. Yêu cầu AI phải xác nhận trước code

- Task đang làm thuộc milestone nào.
- Đã đọc ADR liên quan chưa.
- Tenant context lấy từ đâu.
- Endpoint nào public/admin/platform.
- Test nào chứng minh không truy cập chéo tenant.

## 5. Output mong đợi từ AI

- Code nhỏ, có thể review.
- Không thay đổi ngoài task.
- Migration rõ tên.
- DTO validation.
- OpenAPI decorator/schema.
- Unit/integration test.
- Cập nhật docs khi contract thay đổi.
- Không giả báo test thành công.

## 6. Checklist review mã AI sinh ra

- Có controller gọi Prisma trực tiếp không?
- Có dùng `findUnique({id})` cho tenant resource không?
- Có tin `storeId` từ request body không?
- Có thiếu role guard không?
- Có trả draft/hidden ra public API không?
- Có log token/PII không?
- Có migration và rollback consideration không?
- Có test cho store A/store B không?
- Có thêm dependency không cần thiết không?
- Có phá API/naming mà không cập nhật docs không?
- UI có tuân thủ DESIGN.md, đủ 8 trạng thái và breakpoint mobile chưa?

## 7. First implementation package nên giao AI

### Task A — Bootstrap

- Tạo monorepo `apps/web`, `apps/api`.
- Cấu hình pnpm/Turborepo.
- TypeScript strict, ESLint, Prettier.
- Docker Compose PostgreSQL.
- Nest health endpoint.
- Next placeholder page.
- CI lint/typecheck/build.

### Task B — Prisma foundation

- User, Store, StoreMember schema.
- Enum status/role.
- Migration + seed hai store demo.
- Prisma service/module.
- Integration test kết nối database.

### Task C — Auth and tenant context

- Login/refresh/logout/me.
- Guard xác thực.
- Store membership resolver.
- Current store context.
- Cross-tenant test skeleton.

Chỉ sau khi A–C ổn định mới bắt đầu catalog CRUD.

## 8. Quy tắc quyết định khi tài liệu chưa đủ

AI không tự phát minh nghiệp vụ ảnh hưởng schema/API. Ghi câu hỏi vào `docs/OPEN-QUESTIONS.md` hoặc hỏi người phụ trách. Với chi tiết nhỏ, AI được chọn phương án đơn giản nhất nhưng phải ghi giả định trong summary.
