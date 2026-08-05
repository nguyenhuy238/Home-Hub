# Data Dictionary

## Enum glossary

### StoreStatus

- `ACTIVE`: hoạt động bình thường.
- `SUSPENDED`: bị khóa tạm thời.
- `ARCHIVED`: ngừng sử dụng, chỉ giữ dữ liệu theo chính sách.

### StoreRole

- `OWNER`, `MANAGER`, `EDITOR`, `VIEWER`.

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

## Naming conventions

- Database table/column: snake_case.
- Prisma model/field: PascalCase/camelCase theo Prisma convention, map về snake_case nếu cần.
- JSON/API: camelCase.
- URL slug: lowercase kebab-case.
- Timestamp: UTC trong database; format ISO 8601 ở API.
- Tiền: lưu bằng decimal/numeric, không dùng floating point cho nghiệp vụ tiền.
