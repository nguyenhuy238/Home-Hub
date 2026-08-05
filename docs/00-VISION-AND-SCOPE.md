# 00 — Vision and Scope

## 1. Tầm nhìn

HomeHub là nền tảng giúp cửa hàng nhỏ và vừa tạo một website catalog chuyên nghiệp để giới thiệu sản phẩm/dịch vụ, chia sẻ liên kết trên Facebook/Zalo và chuyển đổi người xem thành khách hàng tiềm năng qua gọi điện hoặc biểu mẫu tư vấn.

## 2. Vấn đề cần giải quyết

Nhiều cửa hàng hiện chỉ đăng sản phẩm trên mạng xã hội. Thông tin bị phân tán, khó tìm lại, khó phân loại, khó xây dựng thương hiệu và chủ cửa hàng không tự quản lý được một website riêng.

HomeHub giải quyết bằng một nền tảng dùng chung nhưng mỗi cửa hàng có:

- Trang giới thiệu riêng.
- Danh mục và sản phẩm riêng.
- Logo, banner, thông tin liên hệ và giao diện riêng.
- Trang quản trị riêng.
- Dữ liệu được cô lập khỏi cửa hàng khác.

## 3. Mục tiêu giai đoạn 1

- Nhiều cửa hàng sử dụng cùng hệ thống.
- Chủ cửa hàng tự quản lý catalog.
- Khách xem tốt trên điện thoại.
- Mỗi sản phẩm có URL riêng để chia sẻ.
- Hỗ trợ SEO/Open Graph cơ bản.
- Khách có thể gọi, mở Zalo/Facebook hoặc gửi yêu cầu tư vấn.
- Có platform admin quản lý cửa hàng và tài khoản.

## 4. Ngoài phạm vi giai đoạn 1

- Giỏ hàng.
- Đơn hàng.
- Thanh toán trực tuyến.
- Đồng bộ đơn vị vận chuyển.
- Quản lý kho chuyên sâu.
- Marketplace tổng hợp sản phẩm giữa các cửa hàng.
- Ứng dụng mobile native.
- Chat realtime.
- Gợi ý AI.

## 5. Nhóm người dùng

### Khách truy cập

Không cần đăng nhập. Xem cửa hàng, tìm sản phẩm, xem chi tiết và liên hệ.

### Thành viên cửa hàng

- `OWNER`: toàn quyền trong cửa hàng.
- `MANAGER`: quản lý nội dung và thành viên theo chính sách.
- `EDITOR`: quản lý catalog.
- `VIEWER`: chỉ xem dữ liệu quản trị.

### Platform admin

Quản lý cửa hàng, trạng thái hoạt động, chủ cửa hàng và thống kê hệ thống.

## 6. Chỉ số thành công ban đầu

- Chủ cửa hàng có thể hoàn tất cấu hình và đăng sản phẩm đầu tiên mà không cần hỗ trợ kỹ thuật.
- Trang sản phẩm tải nhanh trên kết nối di động phổ biến.
- Link chia sẻ hiển thị đúng tên, mô tả và ảnh đại diện.
- Không có truy cập chéo tenant trong kiểm thử bảo mật.
- Luồng tạo cửa hàng → xuất bản sản phẩm → khách gửi tư vấn hoạt động end-to-end.

## 7. Giả định

- Mỗi cửa hàng có ít nhất một `OWNER`.
- Một người dùng có thể thuộc nhiều cửa hàng.
- Giá sản phẩm có thể là giá cố định, “từ”, khoảng giá hoặc “liên hệ”.
- Sản phẩm có thể không quản lý số lượng tồn kho ở giai đoạn 1.
- Dữ liệu người liên hệ thuộc về đúng cửa hàng nhận yêu cầu.
