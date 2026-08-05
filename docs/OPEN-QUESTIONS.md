# Open Questions

Các quyết định dưới đây cần được chốt trước hoặc trong quá trình triển khai. AI không được tự thay đổi nghiệp vụ quan trọng mà không ghi nhận.

1. Một người dùng có thể quản lý nhiều cửa hàng ngay trong MVP hay chỉ chuẩn bị schema?
2. Manager có được quản lý thành viên hay chỉ Owner?
3. Có cần quy trình mời thành viên qua email ở MVP không?
4. Store suspended hiển thị trang thông báo hay trả 404?
5. Thuộc tính sản phẩm MVP dùng bảng definition/value hay JSONB đơn giản trước?
6. Có cần rich-text editor hay chỉ Markdown/plain text có format hạn chế?
7. Cloudinary hay S3-compatible storage cho môi trường đầu tiên?
8. Có cần custom domain ở giai đoạn sau hay chỉ subpath?
9. Thời gian lưu lead/contact request là bao lâu?
10. Có gửi email thông báo khi có lead mới trong MVP không?
11. Có cho Owner tự đổi slug không; nếu có thì có redirect/alias cho link cũ không?
12. Có cần một product thuộc nhiều category trong MVP không?
13. Retention lead là 24 tháng, ẩn danh hay xóa hoàn toàn?
14. Có bắt buộc email invitation ở MVP hay Platform admin tạo membership là đủ?
15. Currency MVP cố định VND hay cần cấu hình theo cửa hàng?

## Baseline đề xuất để bắt đầu coding

Nếu chưa có quyết định khác, dùng các giả định sau và ghi rõ trong task:

- Một user có thể thuộc nhiều store ngay trong MVP.
- Owner quản lý thành viên; Manager chưa được gán OWNER.
- Invitation có thể tạo trạng thái `INVITED`; email provider là P1.
- Store suspended trả trang thông báo public và khóa thao tác admin.
- Attribute dùng definition/value với 4 kiểu dữ liệu; product có một category.
- Mô tả dùng plain text/Markdown giới hạn đã sanitize.
- Media dùng S3-compatible object storage; Cloudinary là phương án thay thế.
- URL MVP là subpath, custom domain để P2.
- Lead retention đề xuất 24 tháng, cần xác nhận trước production.
- Currency mặc định VND; chưa làm đa tiền tệ.

## Quy ước ghi quyết định

Khi một câu hỏi được chốt:

- Đánh dấu trạng thái và ngày.
- Cập nhật PRD/architecture tương ứng.
- Tạo ADR nếu ảnh hưởng lớn đến stack, schema hoặc ranh giới module.
