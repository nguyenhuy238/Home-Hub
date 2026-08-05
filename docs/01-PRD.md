# 01 — Product Requirements Document

## 1. Tóm tắt sản phẩm

HomeHub là SaaS multi-tenant cho website catalog đa cửa hàng. Mỗi cửa hàng quản lý thông tin thương hiệu, danh mục, sản phẩm, dịch vụ và khách hàng tiềm năng của riêng mình.

## 2. Yêu cầu chức năng

### FR-01 — Quản lý tài khoản và đăng nhập

- Người dùng đăng nhập bằng email và mật khẩu.
- Hệ thống hỗ trợ đăng xuất, refresh session và quên mật khẩu ở mốc sau nếu cần.
- Tài khoản bị khóa không được truy cập admin.
- Một người dùng chỉ quản lý một cửa hàng trong MVP.

### FR-02 — Quản lý cửa hàng

- Platform admin tạo, khóa, mở và xem cửa hàng.
- Chủ cửa hàng cập nhật tên, slug, logo, banner, mô tả, địa chỉ, giờ mở cửa và thông tin liên hệ.
- Slug cửa hàng là duy nhất toàn hệ thống.
- Cửa hàng bị khóa không cho phép chỉnh sửa và trang công khai hiển thị trạng thái phù hợp.

### FR-03 — Membership cửa hàng

- Platform admin tạo membership `OWNER` cùng lúc tạo store.
- MVP không có giao diện member management, email invitation hoặc các role khác.

### FR-04 — Quản lý danh mục

- CRUD danh mục và danh mục con.
- Sắp xếp thứ tự hiển thị.
- Ẩn/hiện danh mục.
- Slug danh mục duy nhất trong một cửa hàng.
- Không liên kết sản phẩm với danh mục thuộc cửa hàng khác.

### FR-05 — Quản lý thương hiệu

- CRUD thương hiệu theo cửa hàng.
- Thương hiệu có tên, slug, logo và trạng thái.
- Cho phép sản phẩm không có thương hiệu.

### FR-06 — Quản lý sản phẩm

- CRUD sản phẩm.
- Trường chính: tên, slug, SKU, mô tả ngắn, mô tả rich text đã sanitize, nhiều danh mục, thương hiệu, loại giá, giá, giá khuyến mãi, trạng thái tồn kho, trạng thái xuất bản, nổi bật.
- Nhiều ảnh, kéo thả sắp xếp, chọn ảnh chính.
- Hỗ trợ thuộc tính linh hoạt.
- Một sản phẩm được gắn nhiều category trong cùng cửa hàng.
- Soft delete sản phẩm.
- Không công khai sản phẩm `DRAFT`, `HIDDEN` hoặc đã xóa.

### FR-07 — Quản lý dịch vụ

- CRUD dịch vụ tương tự catalog đơn giản.
- Dịch vụ có tên, slug, mô tả, ảnh, mức giá tham khảo và trạng thái.
- Mô tả product/service được nhập bằng rich-text editor và sanitize ở server.

### FR-08 — Website công khai

- Trang chủ cửa hàng.
- Danh sách sản phẩm.
- Chi tiết sản phẩm.
- Danh mục sản phẩm.
- Trang giới thiệu, dịch vụ và liên hệ.
- Tìm kiếm theo tên/SKU và lọc theo danh mục.
- Giao diện mobile-first.

### FR-09 — Liên hệ và khách hàng tiềm năng

- Nút gọi điện, Zalo, Facebook/Messenger.
- Form yêu cầu tư vấn gồm họ tên, số điện thoại, nội dung và sản phẩm quan tâm.
- Chủ cửa hàng xem danh sách và cập nhật trạng thái: `NEW`, `CONTACTED`, `COMPLETED`, `CANCELLED`.
- Gửi email thông báo lead mới tới email owner sau khi tạo thành công.
- Chống spam cơ bản bằng rate limit/honeypot hoặc CAPTCHA khi cần.

### FR-10 — SEO và chia sẻ

- Metadata theo cửa hàng và sản phẩm.
- Open Graph image/title/description.
- Canonical URL.
- Sitemap theo dữ liệu đã xuất bản.
- Structured data cơ bản cho LocalBusiness và Product/Service.
- Sau MVP hỗ trợ custom domain theo store; MVP dùng subpath.

### FR-11 — Audit và thống kê cơ bản

- Ghi audit cho thao tác nhạy cảm: tạo/sửa/xóa sản phẩm, thay đổi thành viên, thay đổi trạng thái cửa hàng.
- Thống kê cơ bản: tổng sản phẩm, yêu cầu mới, sản phẩm xuất bản.
- View count nâng cao có thể triển khai sau.

## 3. Quy tắc nghiệp vụ

- `salePrice` không lớn hơn `price` khi cả hai có giá trị.
- `FIXED` yêu cầu `price`; `CONTACT` không bắt buộc giá.
- Slug sản phẩm duy nhất trong từng cửa hàng.
- SKU duy nhất trong từng cửa hàng khi SKU được nhập.
- Sản phẩm chỉ liên kết category/brand cùng cửa hàng; mọi liên kết category đi qua `product_categories`.
- Owner có thể đổi store slug; slug cũ tạo alias và redirect 301.
- Cửa hàng bị khóa không thể xuất bản nội dung mới.
- MVP không có thao tác gán role hoặc xóa owner từ giao diện cửa hàng.
- Currency MVP cố định VND; tiền lưu Decimal/numeric.
- Lead PII được anonymize sau 12 tháng.

## 4. Yêu cầu phi chức năng tóm tắt

- Bảo mật: OWASP cơ bản, multi-tenant isolation, secrets management.
- Hiệu năng: pagination, index, CDN ảnh, cache hợp lý.
- Khả dụng: responsive, accessibility cơ bản, trạng thái loading/error/empty.
- Bảo trì: module rõ ràng, TypeScript strict, tests, OpenAPI, migration.
- Vận hành: logging có cấu trúc, backup database, CI/CD.

## 5. Tiêu chí nghiệm thu MVP

1. Platform admin tạo được cửa hàng và owner.
2. Owner đăng nhập, cấu hình cửa hàng, tạo category và sản phẩm có ảnh.
3. Sản phẩm xuất bản hiển thị tại URL công khai.
4. Link sản phẩm có metadata chia sẻ phù hợp.
5. Khách gửi được yêu cầu tư vấn.
6. Owner xem và đổi trạng thái yêu cầu.
7. Kiểm thử chứng minh tenant A không truy cập tenant B.
8. Hệ thống deploy được bằng tài liệu vận hành.
