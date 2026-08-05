# 10 — Roadmap and Backlog

## Milestone 0 — Foundation

- Khởi tạo monorepo pnpm/Turborepo.
- Next.js + NestJS + Prisma + PostgreSQL.
- Lint, format, TypeScript strict.
- Docker Compose local.
- CI cơ bản.
- OpenAPI setup.
- Health check.

**Exit criteria:** web/API build được; API kết nối database; CI xanh.

## Milestone 1 — Identity và Multi-tenancy

- User, store, store_members schema.
- Login/refresh/logout/me.
- Platform admin tạo store + owner.
- Store selector/context.
- Auth, tenant và role guards.
- Cross-tenant integration tests.

**Exit criteria:** owner A không thể đọc bất kỳ resource tenant B trong test mẫu.

## Milestone 2 — Catalog Admin

- Categories.
- Brands.
- Products.
- Services.
- Product images.
- Flexible attributes bản MVP.
- Draft/publish/hide.
- Preview trước publish và audit trạng thái xuất bản.
- Audit log cho catalog.

**Exit criteria:** owner tạo và publish sản phẩm có ảnh từ admin.

## Milestone 3 — Public Storefront

- Store home.
- Product listing/detail.
- Category page.
- Search cơ bản.
- Responsive/mobile-first.
- SEO/Open Graph.

**Exit criteria:** link sản phẩm public render server-side với metadata đúng.

## Milestone 4 — Leads và Store Settings

- Store profile/settings.
- Contact form.
- Lead management/status.
- Rate limit/spam protection.
- Dashboard summary.

**Exit criteria:** khách gửi lead, owner xem và xử lý trong đúng tenant.

## Milestone 5 — Hardening và Release

- E2E browser tests.
- Performance pass.
- Accessibility pass.
- Backup/restore guide.
- Deployment staging/production.
- Demo data và tài liệu nghiệm thu.

## Backlog ưu tiên

### P0 — Bắt buộc MVP

- HH-001 Bootstrap monorepo.
- HH-002 Database foundation và migrations.
- HH-003 Authentication.
- HH-004 Tenant context và authorization.
- HH-005 Platform store management.
- HH-006 Store settings.
- HH-007 Category CRUD.
- HH-008 Product CRUD.
- HH-009 Service CRUD.
- HH-010 Media upload.
- HH-011 Storefront public.
- HH-012 Contact requests.
- HH-013 Cross-tenant security tests.
- HH-014 Deployment and backup.

### P1 — Nên có

- Brand CRUD.
- Product attributes definition/value.
- Member management.
- Audit log UI.
- Sitemap và structured data.
- Import CSV/Excel có giới hạn.
- Dashboard summary.

### P2 — Sau MVP

- Custom domain.
- Theme nâng cao.
- Redis cache.
- Background jobs.
- Advanced analytics.
- Notification email/Zalo provider.
- Full-text/faceted search nâng cao.

## Mẫu user story

**HH-008 — Tạo sản phẩm**  
Là Editor, tôi muốn tạo sản phẩm trong cửa hàng hiện tại để khách có thể xem sau khi sản phẩm được xuất bản.

**Acceptance criteria:**

- Không có `storeId` trong body public DTO.
- Category/brand phải thuộc tenant hiện tại.
- Slug unique trong store.
- Giá tuân thủ `priceType`.
- Có thể lưu draft.
- Có audit log.
- Có unit/integration test và cross-tenant test.
