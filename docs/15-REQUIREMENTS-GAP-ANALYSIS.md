# 15 — Requirements Gap Analysis

Tài liệu này bổ sung các yêu cầu thường bị bỏ sót khi biến ý tưởng “website giới thiệu sản phẩm cho nhiều cửa hàng” thành một sản phẩm có thể vận hành. Các đề xuất bên dưới là baseline để bắt đầu coding; câu nào ảnh hưởng đến nghiệp vụ hoặc chi phí cần được chốt trong `docs/OPEN-QUESTIONS.md`.

## 1. Những yêu cầu đã xác định là bắt buộc cho MVP

| Nhóm | Yêu cầu cần có | Lý do |
|---|---|---|
| Tenant | Store slug duy nhất, trạng thái ACTIVE/SUSPENDED/ARCHIVED, dữ liệu có `store_id` | Tạo link riêng và cô lập cửa hàng |
| Onboarding | Platform admin tạo store + owner; owner hoàn tất hồ sơ và đăng sản phẩm đầu tiên | Có thể demo end-to-end |
| Catalog | Category, brand tùy chọn, product, service, ảnh, giá linh hoạt, draft/publish/hide | Phù hợp nội thất, thiết bị vệ sinh, gạch men và dịch vụ |
| Content | Preview trước publish, slug ổn định, soft delete, audit log | Tránh xuất bản nhầm và mất dữ liệu |
| Media | Object storage, resize/WebP hoặc AVIF, alt text, giới hạn MIME/kích thước | Ảnh là nội dung chính và ảnh hưởng tốc độ |
| Contact | Gọi điện/Zalo/Messenger và form tư vấn gắn với store/product | Mục tiêu chuyển đổi của giai đoạn 1 |
| SEO | SSR/ISR, canonical, sitemap, Open Graph, structured data cơ bản | Link Facebook/Zalo phải xem được và có preview đúng |
| Security | Auth, RBAC, rate limit, tenant scoping, cross-tenant tests, log redaction | Rủi ro nghiêm trọng nhất của SaaS đa tenant |
| Operations | Health check, migration, backup/restore, CI, staging | Có thể triển khai và bảo vệ dữ liệu thật |

## 2. Các quyết định nghiệp vụ nên chốt sớm

### 2.1 URL và nhận diện cửa hàng

Baseline MVP: dùng subpath `/cua-hang/{storeSlug}`. Chưa làm custom domain, nhưng không hard-code route ở nhiều nơi để có thể thêm sau. Slug được tạo từ tên, có thể đổi bởi Owner với cảnh báo ảnh hưởng link cũ; nếu cho đổi, cần redirect hoặc alias.

### 2.2 Vai trò và mời thành viên

Baseline MVP: một user có thể thuộc nhiều store; Owner có thể mời thành viên bằng email hoặc thêm user đã tồn tại; Manager chỉ quản lý catalog và lead, chưa được gán OWNER. Nếu chưa kịp làm email invitation, Platform admin có thể tạo thành viên từ admin platform và schema vẫn giữ trạng thái `INVITED`.

### 2.3 Sản phẩm và dịch vụ

- `Product` là mặt hàng có gallery, SKU tùy chọn, giá và thuộc tính.
- `Service` là mặt hàng phi vật lý có ảnh, mô tả, mức giá tham khảo và CTA tư vấn; không có tồn kho/SKU bắt buộc.
- MVP cho phép một product thuộc một category để form và query đơn giản. Nhiều category là backlog nếu dữ liệu thực tế chứng minh cần.
- Thuộc tính dùng bảng definition/value như tài liệu database; chỉ hỗ trợ TEXT/NUMBER/BOOLEAN/SELECT, chưa làm schema tùy ý.

### 2.4 Trạng thái và xuất bản

Mọi nội dung có `DRAFT`, `PUBLISHED`, `HIDDEN`; chỉ `PUBLISHED` của store `ACTIVE` mới ra public. Nút “Lưu nháp” không làm thay đổi public page. Nút “Xuất bản” phải validate ảnh chính, tên, slug và các trường bắt buộc; nếu lỗi, hiển thị lỗi theo từng field.

### 2.5 Giá và đơn vị

Hỗ trợ `FIXED`, `FROM`, `RANGE`, `CONTACT`. Tiền lưu Decimal/numeric với currency mặc định VND ở MVP; giao diện định dạng `₫` nhưng không dùng floating point. Đơn vị đo, kích thước và quy cách nên đi qua product attributes thay vì thêm cột riêng cho từng ngành.

### 2.6 Rich text và ảnh

Baseline an toàn: mô tả plain text/Markdown giới hạn, hoặc rich text được sanitize bằng allowlist. Không render HTML tự do. Ảnh tải trực tiếp lên object storage bằng signed URL; server sở hữu object key, không dùng tên file từ client làm path.

### 2.7 Lead, riêng tư và retention

Lead chỉ thu họ tên, số điện thoại, email tùy chọn, nội dung, sản phẩm quan tâm và nguồn. Owner/Manager mới xem được lead. Đề xuất retention 24 tháng kể từ lần cập nhật cuối, sau đó ẩn danh hoặc xóa theo chính sách được công bố; cần chốt trước khi có dữ liệu thật.

## 3. Yêu cầu vận hành và tăng trưởng nên chuẩn bị

- Giới hạn số ảnh, dung lượng media và page size theo store để tránh một tenant làm cạn tài nguyên.
- Cấu hình timezone `Asia/Ho_Chi_Minh` cho hiển thị giờ mở cửa, nhưng lưu timestamp UTC.
- Hỗ trợ tiếng Việt trước; text API/frontend dùng Unicode và không nối chuỗi vào URL thiếu slug normalization.
- Có import CSV mẫu sau MVP vì cửa hàng thường đã có bảng sản phẩm; không đưa import phức tạp vào first slice.
- Có event/UTM source hoặc view count ở P2; MVP chỉ lưu `source` do client khai báo với allowlist và không coi đó là attribution chính xác.
- Có trang điều khoản, chính sách riêng tư và thông tin liên hệ của nền tảng trước production.
- Có cơ chế deactivate/export dữ liệu khi cửa hàng ngừng sử dụng.

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

Giỏ hàng, thanh toán, vận chuyển, tồn kho thời gian thực, marketplace tổng hợp, chat realtime, mobile native, custom domain, theme builder CSS tự do, AI recommendation và dashboard analytics nâng cao. Mỗi mục chỉ được thêm khi có ADR, acceptance criteria và tác động vận hành rõ.
