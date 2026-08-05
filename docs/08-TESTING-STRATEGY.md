# 08 — Testing Strategy

## 1. Mục tiêu

Kiểm thử tập trung vào rủi ro nghiệp vụ và multi-tenant, không chạy theo độ phủ dòng code hình thức.

## 2. Pyramid

### Unit test

- Use case và business rules.
- Price validation.
- Permission decision.
- Slug generation.
- Mapping domain/API.

### Integration test

- Prisma repository với PostgreSQL test.
- Unique constraints.
- Transaction.
- Soft delete.
- Tenant scoping.

### E2E/API test

- Login/logout/refresh.
- Tạo category/product.
- Publish và public read.
- Contact request.
- Cross-tenant denial.

### Browser E2E

Dùng Playwright cho các luồng quan trọng:

1. Owner đăng nhập.
2. Tạo category.
3. Tạo sản phẩm có ảnh.
4. Publish.
5. Mở storefront.
6. Gửi yêu cầu tư vấn.
7. Owner cập nhật trạng thái yêu cầu.

## 3. Test fixtures

Tối thiểu:

- Store A và Store B.
- Owner A, Owner B, Platform admin; user không được có membership ACTIVE thứ hai trong MVP.
- Category/product ở mỗi store.
- Store suspended để kiểm thử trạng thái.

## 4. Ma trận permission

Mỗi endpoint quản trị phải được test với:

- unauthenticated.
- user không thuộc store.
- viewer.
- editor.
- manager.
- owner.
- platform admin nếu endpoint liên quan.

## 5. Test dữ liệu công khai

- Chỉ published product được trả.
- Hidden/draft/deleted không xuất hiện.
- Store suspended xử lý đúng.
- Store suspended trả thông báo và không trả catalog.
- Product slug cùng tên ở hai store không xung đột.
- Product có nhiều category cùng tenant; liên kết category khác tenant bị từ chối.
- Rich-text có payload XSS bị sanitize trước khi public render.
- Slug cũ redirect 301 sau khi Owner đổi slug.
- Lead notification retry không tạo duplicate và lead được anonymize sau 12 tháng.

## 6. CI gates

Pull request phải chạy:

```text
lint
format-check
typecheck
unit tests
integration tests trọng yếu
build
```

E2E đầy đủ có thể chạy trên main hoặc trước release tùy thời gian.

## 7. Tiêu chí lỗi

Bug thuộc các nhóm sau là release blocker:

- Truy cập chéo tenant.
- Bypass role.
- Mất dữ liệu.
- Lộ token/secret/PII.
- Không thể đăng nhập hoặc xuất bản sản phẩm.
- Public product không thể truy cập từ URL chuẩn.
