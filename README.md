# HomeHub Documentation Pack

Bộ tài liệu nguồn chuẩn cho dự án **HomeHub** – nền tảng đa cửa hàng dùng để giới thiệu sản phẩm/dịch vụ và tiếp nhận nhu cầu tư vấn.

## Mục tiêu

- Giúp con người và AI hiểu cùng một phạm vi, kiến trúc và quy tắc triển khai.
- Giảm việc AI tự suy diễn hoặc thay đổi công nghệ không cần thiết.
- Đảm bảo multi-tenant, bảo mật, kiểm thử và khả năng bảo trì được xem là yêu cầu bắt buộc.

## Phạm vi giai đoạn 1

HomeHub cho phép nhiều cửa hàng tạo website catalog riêng, quản lý sản phẩm/dịch vụ và nhận yêu cầu tư vấn. Giai đoạn 1 **không** triển khai giỏ hàng, thanh toán, giao vận hoặc quản lý kho chuyên sâu.

## Thứ tự đọc khuyến nghị

1. `AGENTS.md`
2. `DESIGN.md`
3. `docs/00-VISION-AND-SCOPE.md`
4. `docs/01-PRD.md`
5. `docs/02-USE-CASES.md`
6. `docs/03-SYSTEM-ARCHITECTURE.md`
7. `docs/04-DATABASE-DESIGN.md`
8. `docs/05-API-DESIGN.md`
9. `docs/06-SECURITY-AND-MULTITENANCY.md`
10. `docs/15-REQUIREMENTS-GAP-ANALYSIS.md`
11. `docs/16-IMPLEMENTATION-PLAN.md`
12. `docs/10-ROADMAP-AND-BACKLOG.md`
13. `docs/11-AI-HANDOFF.md`

## Cách đưa vào repository

Sao chép toàn bộ nội dung của thư mục này vào thư mục gốc repository HomeHub. AI coding agent phải đọc `AGENTS.md` và `docs/11-AI-HANDOFF.md` trước khi chỉnh sửa mã nguồn.

## Stack đã thống nhất

- TypeScript
- Next.js App Router
- NestJS modular monolith
- PostgreSQL
- Prisma ORM
- Tailwind CSS + shadcn/ui
- REST API + OpenAPI
- Vercel cho môi trường đầu tiên, Vercel Blob cho media, PostgreSQL managed
- Resend (baseline) cho email thông báo lead
- pnpm workspace + Turborepo
- Docker + GitHub Actions

## Quy tắc tối quan trọng

1. Dữ liệu của cửa hàng phải được cô lập tuyệt đối bằng `store_id`.
2. Backend không tin `storeId` do client gửi lên.
3. Controller không chứa business logic và không gọi Prisma trực tiếp.
4. Mọi thay đổi schema phải có migration.
5. Mọi chức năng liên quan tenant phải có kiểm thử cross-tenant.
6. Không mở rộng sang thương mại điện tử trong MVP nếu chưa có quyết định mới.

## Design source of truth

`DESIGN.md` khóa hướng hình ảnh, design tokens, cấu trúc storefront/admin,
responsive contract và các anti-pattern cần tránh. Tài liệu này được xây dựng
theo các nguyên tắc trong thư mục `hallmark` và `open-design` đã được cung cấp.

## Trạng thái code

Mã nguồn MVP đang ở `apps/api`, `apps/web` và `packages/contracts`. Xem
`docs/17-IMPLEMENTATION-STATUS.md` để chạy local, seed demo và biết các phần
đang để sau MVP.
