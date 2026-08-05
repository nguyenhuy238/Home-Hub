# 15 — Requirements Gap Analysis

Tài liệu này bổ sung các yêu cầu thường bị bỏ sót khi biến ý tưởng “website giới thiệu sản phẩm cho nhiều cửa hàng” thành một sản phẩm có thể vận hành. Các quyết định trong `docs/OPEN-QUESTIONS.md` đã được chốt ngày 2026-08-05 và được áp dụng ở đây.

## 1. Những yêu cầu đã xác định là bắt buộc cho MVP

| Nhóm | Yêu cầu cần có | Lý do |
|---|---|---|
| Tenant | Store slug duy nhất, alias slug, trạng thái ACTIVE/SUSPENDED/ARCHIVED, dữ liệu có `store_id` | Tạo link riêng và cô lập cửa hàng |
| Onboarding | Platform admin tạo store + owner; owner hoàn tất hồ sơ và đăng sản phẩm đầu tiên | Có thể demo end-to-end |
| Catalog | Category, brand tùy chọn, product, service, ảnh, giá linh hoạt, draft/publish/hide | Phù hợp nội thất, thiết bị vệ sinh, gạch men và dịch vụ |
| Content | Preview trước publish, slug ổn định, soft delete, audit log | Tránh xuất bản nhầm và mất dữ liệu |
| Media | Vercel Blob, resize/WebP hoặc AVIF, alt text, giới hạn MIME/kích thước | Ảnh là nội dung chính và ảnh hưởng tốc độ |
| Contact | Gọi điện/Zalo/Messenger, form tư vấn, email notification và anonymize sau 12 tháng | Mục tiêu chuyển đổi và privacy |
| SEO | SSR/ISR, canonical, sitemap, Open Graph, structured data cơ bản | Link Facebook/Zalo phải xem được và có preview đúng |
| Security | Auth, RBAC, rate limit, tenant scoping, cross-tenant tests, log redaction | Rủi ro nghiêm trọng nhất của SaaS đa tenant |
| Operations | Health check, migration, backup/restore, CI, staging | Có thể triển khai và bảo vệ dữ liệu thật |

## 2. Các quyết định nghiệp vụ nên chốt sớm

### 2.1 URL và nhận diện cửa hàng

MVP dùng subpath `/cua-hang/{storeSlug}`. Owner được đổi slug; slug cũ lưu trong `store_slug_aliases` và redirect 301. Custom domain được triển khai ở phase sau qua domain mapping/verification của Vercel.

### 2.2 Vai trò và mời thành viên

MVP chỉ có một user OWNER cho một store. Platform admin tạo user, store và membership trong transaction; không có email invitation, Manager hay member management UI.

### 2.3 Sản phẩm và dịch vụ

- `Product` là mặt hàng có gallery, SKU tùy chọn, giá và thuộc tính.
- `Service` là mặt hàng phi vật lý có ảnh, mô tả, mức giá tham khảo và CTA tư vấn; không có tồn kho/SKU bắt buộc.
- Product có thể thuộc nhiều category qua `product_categories`; mọi liên kết phải cùng tenant.
- Thuộc tính dùng bảng definition/value như tài liệu database; chỉ hỗ trợ TEXT/NUMBER/BOOLEAN/SELECT, chưa làm schema tùy ý.

### 2.4 Trạng thái và xuất bản

Mọi nội dung có `DRAFT`, `PUBLISHED`, `HIDDEN`; chỉ `PUBLISHED` của store `ACTIVE` mới ra public. Nút “Lưu nháp” không làm thay đổi public page. Nút “Xuất bản” phải validate ảnh chính, tên, slug và các trường bắt buộc; nếu lỗi, hiển thị lỗi theo từng field.

### 2.5 Giá và đơn vị

Hỗ trợ `FIXED`, `FROM`, `RANGE`, `CONTACT`. Tiền lưu Decimal/numeric với currency mặc định VND ở MVP; giao diện định dạng `₫` nhưng không dùng floating point. Đơn vị đo, kích thước và quy cách nên đi qua product attributes thay vì thêm cột riêng cho từng ngành.

### 2.6 Rich text và ảnh

Mô tả dùng rich-text editor. Server sanitize bằng allowlist trước khi lưu/render, không render HTML tự do. Ảnh tải trực tiếp lên Vercel Blob bằng signed upload; server sở hữu object key, không dùng tên file từ client làm path.

### 2.7 Lead, riêng tư và retention

Lead chỉ thu họ tên, số điện thoại, email tùy chọn, nội dung, sản phẩm quan tâm và nguồn. Owner mới xem được lead. Gửi email notification qua Resend sau commit; sau 12 tháng job idempotent anonymize PII, giữ metadata tối thiểu.

## 3. Yêu cầu vận hành và tăng trưởng nên chuẩn bị

- Giới hạn số ảnh, dung lượng media và page size theo store để tránh một tenant làm cạn tài nguyên.
- Cấu hình timezone `Asia/Ho_Chi_Minh` cho hiển thị giờ mở cửa, nhưng lưu timestamp UTC.
- Hỗ trợ tiếng Việt trước; text API/frontend dùng Unicode và không nối chuỗi vào URL thiếu slug normalization.
- Có import CSV mẫu sau MVP vì cửa hàng thường đã có bảng sản phẩm; không đưa import phức tạp vào first slice.
- Có event/UTM source hoặc view count ở P2; MVP chỉ lưu `source` do client khai báo với allowlist và không coi đó là attribution chính xác.
- Có trang điều khoản, chính sách riêng tư và thông tin liên hệ của nền tảng trước production.
- Có cơ chế deactivate/export dữ liệu khi cửa hàng ngừng sử dụng.
- Vercel Cron hoặc worker tương đương phải chạy job anonymize và có retry email delivery.

## 4. Definition of Ready trước khi code module

Một task chỉ được bắt đầu khi đã có:

1. Actor, precondition, happy path và lỗi chính.
2. Quyền truy cập và trusted tenant context.
3. Input/output DTO và endpoint scope.
4. Database constraint/index/migration cần thiết.
5. Unit/integration/E2E test dự kiến.
6. Loading/empty/error/success state nếu có UI.
7. Quyết định đã chốt hoặc giả định được ghi lại.

## 5. Không đưa vào MVP dù dễ bị yêu cầu thêm

Giỏ hàng, thanh toán, vận chuyển, tồn kho thời gian thực, marketplace tổng hợp, chat realtime, mobile native, theme builder CSS tự do, AI recommendation và dashboard analytics nâng cao vẫn ngoài MVP. Custom domain là phase sau đã được chấp thuận và vẫn cần ADR/acceptance criteria triển khai riêng.
