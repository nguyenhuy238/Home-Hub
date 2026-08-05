# Decision Register

Các quyết định dưới đây đã được chủ dự án xác nhận ngày **2026-08-05**. Đây là nguồn nghiệp vụ đã chốt; AI không được quay lại baseline cũ nếu chưa có quyết định mới.

| # | Quyết định | Trạng thái và tác động |
|---|---|---|
| 1 | Một user chỉ thuộc một cửa hàng trong MVP | Đã chốt. Không làm store selector/multi-store switching; schema có thể mở rộng về sau. |
| 2 | Chỉ có role `OWNER` | Đã chốt. Không triển khai `MANAGER`, `EDITOR`, `VIEWER` trong MVP. |
| 3 | Không có email invitation | Đã chốt. Platform admin tạo user, store và membership `OWNER`. |
| 4 | Store `SUSPENDED` hiển thị trang thông báo | Đã chốt. Không hiển thị catalog; admin bị khóa. |
| 5 | Product attributes dùng definition/value | Đã chốt. Giữ các kiểu TEXT/NUMBER/BOOLEAN/SELECT. |
| 6 | Dùng rich-text editor | Đã chốt. HTML/JSON đầu vào phải được sanitize server-side trước khi render. |
| 7 | Triển khai đầu tiên trên Vercel | Đã chốt theo baseline: Vercel cho web/API, Vercel Blob cho media, PostgreSQL managed bên ngoài. |
| 8 | Có custom domain | Đã chốt cho giai đoạn sau subpath MVP; cần domain mapping và verification trên Vercel. |
| 9 | Lead lưu 12 tháng | Đã chốt. Sau 12 tháng phải anonymize, không giữ PII nguyên bản. |
| 10 | Gửi email khi có lead mới | Đã chốt. MVP dùng email provider transactional; baseline triển khai là Resend. |
| 11 | Owner được đổi store slug | Đã chốt. Slug cũ trở thành alias và redirect 301 tới slug mới. |
| 12 | Product thuộc nhiều category | Đã chốt. Dùng bảng nối `product_categories`; mọi category phải cùng tenant. |
| 13 | Retention xử lý bằng anonymization | Đã chốt. Xóa/ẩn danh PII, giữ metadata nghiệp vụ tối thiểu. |
| 14 | Platform admin tạo membership | Đã chốt. Không cần luồng mời thành viên trong MVP. |
| 15 | Currency cố định VND | Đã chốt. Không thêm cấu hình đa tiền tệ trong MVP. |

## Quy ước ghi quyết định

Khi một câu hỏi được chốt:

- Đánh dấu trạng thái và ngày.
- Cập nhật PRD/architecture tương ứng.
- Tạo ADR nếu ảnh hưởng lớn đến stack, schema hoặc ranh giới module.
