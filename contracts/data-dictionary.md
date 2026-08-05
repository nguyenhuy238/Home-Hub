# Data Dictionary

## Enum glossary

### StoreStatus

- `ACTIVE`: hoạt động bình thường.
- `SUSPENDED`: bị khóa tạm thời.
- `ARCHIVED`: ngừng sử dụng, chỉ giữ dữ liệu theo chính sách.

### StoreRole

- MVP chỉ có `OWNER`.

### PublicationStatus

- `DRAFT`: chỉ trong admin.
- `PUBLISHED`: hiển thị công khai.
- `HIDDEN`: không hiển thị nhưng chưa xóa.

### PriceType

- `FIXED`: một giá cụ thể.
- `CONTACT`: liên hệ để biết giá.
- `FROM`: giá từ một mức.
- `RANGE`: khoảng min/max.

### Service

- Dịch vụ phi vật lý của một cửa hàng; không bắt buộc SKU hoặc tồn kho.
- Có `slug`, mô tả, ảnh đại diện, giá tham khảo và publication status giống catalog.

### ContactRequestStatus

- `NEW`, `CONTACTED`, `COMPLETED`, `CANCELLED`.

### ContactNotificationStatus

- `PENDING`: lead đã tạo, email chưa gửi hoặc đang retry.
- `SENT`: email notification đã gửi thành công.
- `FAILED`: provider lỗi sau lần thử; không làm mất lead.

### LeadRetention

- Sau 12 tháng, anonymize `customer_name`, `customer_phone`, `customer_email`
  và nội dung có PII; giữ status, source, product reference và timestamps tối thiểu.

### ProductCategory

- Quan hệ nhiều-nhiều giữa product và category trong cùng một store.
- Một product đã publish phải có ít nhất một category.

## Naming conventions

- Database table/column: snake_case.
- Prisma model/field: PascalCase/camelCase theo Prisma convention, map về snake_case nếu cần.
- JSON/API: camelCase.
- URL slug: lowercase kebab-case.
- Timestamp: UTC trong database; format ISO 8601 ở API.
- Tiền: lưu bằng decimal/numeric, không dùng floating point cho nghiệp vụ tiền.
- Currency MVP: VND cố định, không nhận currency từ client.
