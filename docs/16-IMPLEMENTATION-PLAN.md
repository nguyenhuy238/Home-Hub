# 16 — Implementation Plan

Kế hoạch này biến bộ đặc tả thành các lát cắt có thể code, review và demo. Mỗi milestone phải giữ được hệ thống chạy được; không chờ đến cuối mới tích hợp frontend, API và database.

## 1. Nguyên tắc phát triển

- Monorepo pnpm/Turborepo; web Next.js App Router; API NestJS modular monolith; PostgreSQL/Prisma.
- Mỗi task chạm một module sở hữu nghiệp vụ, có migration/contract/test tương ứng.
- API contract, OpenAPI và response error được cập nhật cùng code.
- Mọi resource tenant-owned đều đi qua trusted tenant context; test A/B là điều kiện bắt buộc.
- Dùng `DESIGN.md` làm nguồn sự thật của giao diện; không tạo theme riêng cho từng cửa hàng ở MVP.
- Commit nhỏ theo task; không gom toàn bộ milestone vào một commit khó review.

## 2. Trình tự thực hiện đề xuất

### Slice 0 — Bootstrap chạy được

Tạo `apps/web`, `apps/api`, packages config, strict TypeScript, lint/format, Docker Compose PostgreSQL, health endpoint, `.env.example`, seed skeleton và CI. Kết thúc bằng web placeholder + API health + build xanh.

### Slice 1 — Identity và tenant context

Tạo `users`, `stores`, `store_members`, auth login/refresh/logout/me, password hash, session cookie, membership resolver, store selector và role guard. Seed Store A/B cùng tài khoản test. Bắt buộc có test user A không đọc context B.

### Slice 2 — Store settings và media foundation

Tạo store settings, signed upload URL, media validation, object key convention, image metadata và audit log. Làm trang cấu hình logo/banner/contact trước khi làm product gallery.

### Slice 3 — Catalog admin

Làm theo thứ tự category → brand → product → attributes → service. Mỗi module hoàn chỉnh gồm list/create/edit/delete soft delete, validation, permission, OpenAPI, repository scoped và test. Product form tách section theo `DESIGN.md`.

### Slice 4 — Preview/publish và public storefront

Tạo public store home, category/listing, product detail, service page, search cơ bản, SSR metadata, OG/canonical/sitemap. Chỉ published content của active store được trả. Thêm browser test mở đúng URL từ link chia sẻ.

### Slice 5 — Contact requests và dashboard

Thêm form public có rate limit/honeypot, lead list/detail/status, store dashboard summary và CTA gọi/Zalo/Messenger. Test lead của A không xuất hiện trong B; test empty/error/success UI.

### Slice 6 — Hardening và release

Chạy E2E đầy đủ, kiểm tra accessibility/mobile, p95 read cơ bản, backup/restore, staging deploy, secret scan, migration review và smoke test production-like.

## 3. Thứ tự task đầu tiên

| ID | Task | Điều kiện nghiệm thu chính |
|---|---|---|
| HH-001 | Bootstrap monorepo | web/api chạy; lint/typecheck/build; CI workflow |
| HH-002 | Prisma foundation | migration + seed hai store; repository kết nối DB |
| HH-003 | Authentication | login/refresh/logout/me; refresh token lưu hash |
| HH-004 | Tenant context | mọi admin query có store scope; test A/B đỏ nếu bỏ scope |
| HH-005 | Platform store management | tạo store + owner trong transaction |
| HH-006 | Store settings/media | upload signed URL; MIME/size/ownership được kiểm tra |
| HH-007 | Category CRUD | slug scoped; parent cùng tenant; role test |
| HH-008 | Product CRUD | giá/slug/category/brand/image validation; draft/publish |
| HH-009 | Service CRUD | public/admin contract nhất quán với product |
| HH-010 | Storefront | SSR store/list/detail; draft/hidden không public |
| HH-011 | Contact requests | rate limit; lead đúng tenant; status workflow |
| HH-012 | Release hardening | E2E, a11y, backup/restore, deployment guide |

## 4. Vòng lặp cho mỗi task

1. Đọc `AGENTS.md`, tài liệu module và ADR liên quan.
2. Viết acceptance criteria và file dự kiến thay đổi.
3. Cập nhật contract/schema trước nếu boundary thay đổi.
4. Implement use case + repository scoped + controller mỏng.
5. Viết test unit/integration; thêm cross-tenant test cho resource.
6. Implement UI với đủ loading/empty/error/success và kiểm tra responsive.
7. Chạy lint, format-check, typecheck, test liên quan, build.
8. Cập nhật docs/ADR nếu quyết định hoặc contract thay đổi.

## 5. Chiến lược nhánh và GitHub

- `main` là nhánh ổn định; mỗi task dùng nhánh `feat/HH-xxx-short-name` hoặc `fix/HH-xxx-short-name`.
- Pull request phải mô tả why, user-visible change, scope, migration, test và ảnh UI nếu có.
- Không commit `.env`, token, ảnh upload thật, build output hoặc database dump.
- Merge một task nhỏ khi CI xanh; tag bản demo sau mỗi milestone.

## 6. Demo checkpoint cho đồ án

- Checkpoint A: đăng nhập owner A, tạo category và lưu product draft.
- Checkpoint B: upload ảnh, publish product, mở URL public và xem social metadata.
- Checkpoint C: khách gửi form; owner A xử lý lead; owner B không thấy dữ liệu A.
- Checkpoint D: platform admin tạo store mới; store mới có trang rỗng và onboarding rõ ràng.

## 7. Tiêu chí sẵn sàng để mở rộng sau MVP

Chỉ cân nhắc import hàng loạt, custom domain, analytics, notification, search nâng cao hoặc thương mại điện tử sau khi: tenant isolation test ổn định, backup/restore đã thử, media quota có số liệu, funnel contact có dữ liệu thực và có ADR cho phạm vi mới.
