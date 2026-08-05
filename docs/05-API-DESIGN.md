# 05 — API Design

## 1. Nguyên tắc

- REST JSON.
- Prefix `/api/v1`.
- OpenAPI là contract có thể sinh API client.
- JSON dùng camelCase.
- ID là opaque string; client không suy luận cấu trúc.
- Pagination mặc định; giới hạn `pageSize` phía server.
- Lỗi có `code` ổn định để frontend xử lý.

## 2. Nhóm endpoint

### Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Public storefront

```text
GET  /api/v1/public/stores/{storeSlug}
GET  /api/v1/public/stores/{storeSlug}/categories
GET  /api/v1/public/stores/{storeSlug}/products
GET  /api/v1/public/stores/{storeSlug}/products/{productSlug}
GET  /api/v1/public/stores/{storeSlug}/services
POST /api/v1/public/stores/{storeSlug}/contact-requests
```

Store `SUSPENDED` trả trạng thái và thông báo public nhưng không trả catalog.
Slug cũ trong `store_slug_aliases` redirect 301 tới slug hiện tại ở public route.

### Store admin

```text
GET    /api/v1/admin/context
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/{productId}
PATCH  /api/v1/admin/products/{productId}
DELETE /api/v1/admin/products/{productId}

GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PATCH  /api/v1/admin/categories/{categoryId}
DELETE /api/v1/admin/categories/{categoryId}

GET    /api/v1/admin/services
POST   /api/v1/admin/services
GET    /api/v1/admin/services/{serviceId}
PATCH  /api/v1/admin/services/{serviceId}
DELETE /api/v1/admin/services/{serviceId}

GET    /api/v1/admin/contact-requests
GET    /api/v1/admin/contact-requests/{contactRequestId}
PATCH  /api/v1/admin/contact-requests/{contactRequestId}/status

GET    /api/v1/admin/store-settings
PATCH  /api/v1/admin/store-settings
PATCH  /api/v1/admin/store-settings/slug
POST   /api/v1/admin/media/upload-url
```

Tenant được xác định từ membership duy nhất của user hiện tại. Không đặt `storeId` trong body để client tự chọn và không có store selector trong MVP.

### Platform admin

```text
GET   /api/v1/platform/stores
POST  /api/v1/platform/stores
GET   /api/v1/platform/stores/{storeId}
PATCH /api/v1/platform/stores/{storeId}/status
POST  /api/v1/platform/stores/{storeId}/owners
```

Platform admin là nơi duy nhất tạo membership `OWNER`; endpoint từ chối user đã
thuộc một store trong MVP.

## 3. Response chuẩn

### Thành công đơn

```json
{
  "data": {
    "id": "prd_123",
    "name": "Bàn ăn gỗ sồi"
  }
}
```

### Danh sách

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Lỗi

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Không tìm thấy sản phẩm",
    "details": null,
    "requestId": "req_..."
  }
}
```

## 4. HTTP status

- `200`: đọc/cập nhật thành công.
- `201`: tạo thành công.
- `204`: xóa/không có body.
- `400`: dữ liệu không hợp lệ.
- `401`: chưa xác thực/session hết hạn.
- `403`: không đủ quyền.
- `404`: tài nguyên không tồn tại hoặc không thuộc tenant hiện tại.
- `409`: conflict/slug trùng/quy tắc nghiệp vụ.
- `422`: validation phức tạp nếu dự án lựa chọn dùng.
- `429`: rate limit.
- `500`: lỗi nội bộ không lộ chi tiết.

## 5. Query danh sách sản phẩm

```text
GET /api/v1/public/stores/{storeSlug}/products
  ?page=1
  &pageSize=24
  &search=ban+an
  &categorySlug=ban-ghe
  &categorySlug=ban-an
  &brandSlug=...
  &featured=true
  &sort=newest
```

Chỉ whitelist giá trị sort. Không nối trực tiếp query client vào SQL.
Category filter dùng nhiều giá trị lặp lại và truy vấn qua `product_categories`.

## 6. Idempotency và concurrency

- PATCH dùng cập nhật một phần.
- Có thể bổ sung `version`/optimistic concurrency cho form quan trọng sau MVP.
- Upload URL có thời hạn ngắn và giới hạn loại file/kích thước.
- Rich text chỉ nhận payload được validate và sanitize server-side; không tin HTML từ client.
- Giá public luôn có currency `VND` trong MVP.

## 7. Public DTO

Public API không trả:

- `storeId` nội bộ nếu không cần.
- audit fields nhạy cảm.
- email quản trị.
- storage secret/key không an toàn.
- sản phẩm draft/hidden/deleted.
- thông tin email delivery hoặc PII đã anonymize.
