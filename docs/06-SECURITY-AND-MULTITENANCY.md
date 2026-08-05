# 06 — Security and Multitenancy

## 1. Mục tiêu bảo mật

- Ngăn truy cập chéo tenant.
- Bảo vệ tài khoản quản trị.
- Không lộ secret/token/PII.
- Upload media an toàn.
- Giảm spam và abuse trên public form.
- Có audit trail cho thao tác quan trọng.

## 2. Tenant context

### Admin request

Tenant context được suy ra từ:

1. Authenticated user.
2. Store membership đang hoạt động.
3. Store đang hoạt động.
4. Store được chọn trong session/header đã được backend xác thực.

Client có thể gửi ID cửa hàng đang chọn, nhưng backend phải xác minh membership trước khi tạo trusted context.

### Public request

Tenant được suy ra từ `storeSlug`; backend chỉ trả store `ACTIVE` và dữ liệu `PUBLISHED`.

## 3. Chống IDOR

Mọi thao tác tenant-owned dùng điều kiện kép:

```text
resource.id = requestedId
AND resource.store_id = trustedStoreId
```

Không kiểm tra ownership sau khi đã tải resource bằng ID đơn lẻ.

## 4. Authentication

- Password hash bằng Argon2 hoặc bcrypt với cấu hình an toàn.
- Access token ngắn hạn.
- Refresh token trong HttpOnly, Secure cookie hoặc cơ chế session tương đương.
- Refresh token lưu dạng hash, hỗ trợ revoke.
- SameSite và CORS được cấu hình theo topology triển khai.
- Rate limit login và refresh.
- Không lưu refresh token trong localStorage.

## 5. Authorization

RBAC cấp cửa hàng:

| Quyền | OWNER | MANAGER | EDITOR | VIEWER |
|---|---:|---:|---:|---:|
| Xem dashboard | ✓ | ✓ | ✓ | ✓ |
| CRUD sản phẩm | ✓ | ✓ | ✓ | chỉ xem |
| Quản lý yêu cầu | ✓ | ✓ | tùy chính sách | chỉ xem |
| Cấu hình cửa hàng | ✓ | ✓ | ✗ | ✗ |
| Quản lý thành viên | ✓ | tùy chính sách | ✗ | ✗ |
| Gán OWNER | ✓ | ✗ | ✗ | ✗ |

Platform admin là scope riêng, không dùng chung role store.

## 6. Validation và output encoding

- Validate DTO bằng whitelist và reject field lạ ở API nhạy cảm.
- Giới hạn độ dài tên, slug, mô tả và message.
- Sanitize/kiểm soát rich text trước khi render.
- Không render HTML người dùng nhập bằng `dangerouslySetInnerHTML` nếu chưa sanitize.
- Dùng parameterized query qua Prisma.

## 7. Upload media

- Whitelist MIME: JPEG, PNG, WebP; SVG chỉ khi có quy trình sanitize rõ.
- Giới hạn kích thước và số lượng ảnh.
- Tên object sinh bởi server, không dùng tên file client làm path tin cậy.
- Signed URL có thời hạn ngắn.
- Xác minh metadata sau upload nếu cần.
- Không cho upload executable/public HTML.

## 8. Public contact form

- Rate limit theo IP/store.
- Honeypot hoặc CAPTCHA khi có dấu hiệu spam.
- Validate số điện thoại và độ dài message.
- Không phản hồi thông tin cho biết số điện thoại/email đã tồn tại.
- Log tối thiểu; có chính sách lưu trữ/xóa PII.

## 9. Secrets và logging

- Secret chỉ ở environment/secret manager.
- Không commit `.env`.
- Redact authorization header, cookie, password, token.
- Log có `requestId`, actorId, storeId và outcome; không log PII đầy đủ nếu không cần.

## 10. Database security

- App user không dùng superuser.
- Migrations dùng credential riêng khi có thể.
- Backup mã hóa và kiểm thử restore.
- Có thể bổ sung PostgreSQL Row Level Security ở giai đoạn hardening, nhưng không thay thế application-level scoping.

## 11. Security test bắt buộc

- Store A không GET/PATCH/DELETE product của Store B.
- Store A không gắn category/brand/image của Store B.
- Viewer không tạo/sửa dữ liệu.
- Editor không quản lý owner.
- Public API không trả draft/hidden/deleted.
- Suspended store không cho thao tác quản trị bị cấm.
- Upload URL không tạo được nếu thiếu quyền.
- Login rate limit hoạt động.
