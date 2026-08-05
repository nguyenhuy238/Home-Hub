# AGENTS.md — HomeHub

Tài liệu này là chỉ dẫn bắt buộc cho mọi AI coding agent làm việc trong repository.

## 1. Nguồn sự thật

Đọc theo thứ tự:

1. `docs/00-VISION-AND-SCOPE.md`
2. `docs/01-PRD.md`
3. `docs/03-SYSTEM-ARCHITECTURE.md`
4. `docs/04-DATABASE-DESIGN.md`
5. `docs/05-API-DESIGN.md`
6. `docs/06-SECURITY-AND-MULTITENANCY.md`
7. `docs/11-AI-HANDOFF.md`
8. ADR trong `docs/adr/`

Trước khi chạm vào UI, đọc thêm `DESIGN.md`, `docs/15-REQUIREMENTS-GAP-ANALYSIS.md`
và `docs/16-IMPLEMENTATION-PLAN.md`.

Khi tài liệu mâu thuẫn, ưu tiên theo thứ tự: ADR mới nhất → Security & Multitenancy → Architecture → PRD → Backlog.

## 2. Kiến trúc không được tự ý thay đổi

- Monorepo: pnpm workspace + Turborepo.
- `apps/web`: Next.js App Router.
- `apps/api`: NestJS modular monolith.
- Database: PostgreSQL qua Prisma.
- API: REST, prefix `/api/v1`, tài liệu OpenAPI.
- Multi-tenant: shared database/shared schema, tenant-owned rows có `store_id`.
- Ảnh lưu ở object storage, không lưu binary trong PostgreSQL và không lưu vĩnh viễn trong container.

Không đưa vào microservices, GraphQL, event sourcing, Kubernetes hoặc CQRS toàn hệ thống nếu chưa có ADR được chấp thuận.

## 3. Quy tắc multi-tenant bắt buộc

- Không nhận `storeId` trong DTO tạo/sửa dữ liệu tenant nếu có thể suy ra từ phiên đăng nhập hoặc route công khai.
- Mọi truy vấn tenant-owned phải chứa điều kiện `store_id`.
- Không truy vấn theo `id` đơn lẻ đối với dữ liệu tenant-owned.
- Repository nhận `tenantContext` hoặc `storeId` rõ ràng.
- Category/brand/product/image/contact phải được kiểm tra cùng tenant trước khi liên kết.
- Viết test chứng minh cửa hàng A không đọc/sửa/xóa dữ liệu cửa hàng B.

## 4. Quy tắc code

- TypeScript `strict: true`.
- Không dùng `any` trừ khi có chú thích lý do.
- Controller mỏng: validate → gọi use case/service → map response.
- Business logic ở application/domain service.
- Prisma chỉ được gọi từ lớp infrastructure/repository hoặc data service đã được kiểm soát.
- Không log access token, refresh token, mật khẩu, secret hoặc nội dung nhạy cảm đầy đủ.
- Tên file dùng kebab-case; class/type dùng PascalCase; biến/hàm dùng camelCase.
- Mọi endpoint mới phải có DTO validation, authorization, OpenAPI description và test phù hợp.

## 5. Quy trình thực hiện một task

1. Đọc acceptance criteria.
2. Xác định module sở hữu nghiệp vụ.
3. Nêu ngắn gọn kế hoạch và file dự kiến thay đổi.
4. Implement phần nhỏ nhất đáp ứng yêu cầu.
5. Thêm/cập nhật migration nếu schema thay đổi.
6. Viết hoặc cập nhật test.
7. Chạy lint, typecheck, unit/integration test liên quan.
8. Cập nhật tài liệu nếu API, schema hoặc quyết định kiến trúc thay đổi.
9. Tóm tắt thay đổi, rủi ro và phần chưa hoàn thành.

## 6. Không được tự ý làm

- Không thêm chức năng thanh toán, đơn hàng hoặc vận chuyển trong MVP.
- Không thay đổi naming/URL công khai mà không cập nhật tài liệu và redirect plan.
- Không xóa migration đã được dùng ở môi trường chia sẻ.
- Không thêm dependency chỉ để giải quyết việc có thể làm bằng thư viện hiện có.
- Không commit secret, `.env`, file build hoặc ảnh upload thực tế.
- Không giả định thành công khi test chưa chạy.

## 7. Definition of Done tối thiểu

Task chỉ hoàn thành khi:

- Đạt acceptance criteria.
- Không phá isolation giữa tenant.
- Có validation và error handling.
- Có test phù hợp.
- Lint/typecheck/build liên quan thành công.
- API/schema/documentation được cập nhật khi cần.
