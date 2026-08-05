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
2. Membership `OWNER` duy nhất đang hoạt động.
3. Store đang hoạt động cho thao tác admin.

MVP không có store selector, không có email invitation và client không được
tự chọn `storeId`. Nếu user đã thuộc store khác, platform admin phải xử lý
membership bằng workflow được kiểm soát.

### Public request

Tenant được suy ra từ `storeSlug`; backend trả catalog của store `ACTIVE`,
hoặc trạng thái/thông báo của store `SUSPENDED` nhưng không trả dữ liệu catalog.

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

| Quyền | OWNER | PLATFORM ADMIN |
|---|---:|---:|
| Xem dashboard | ✓ | tùy scope |
| CRUD sản phẩm/dịch vụ | ✓ | không trực tiếp |
| Quản lý yêu cầu | ✓ | không trực tiếp |
| Cấu hình cửa hàng và đổi slug | ✓ | hỗ trợ khi cần |
| Tạo store/membership | ✗ | ✓ |

Platform admin là scope riêng, không dùng chung role store.

## 6. Validation và output encoding

- Validate DTO bằng whitelist và reject field lạ ở API nhạy cảm.
- Giới hạn độ dài tên, slug, mô tả và message.
- Rich text phải được sanitize server-side bằng allowlist trước khi lưu/render; test payload XSS.
- Không render HTML người dùng nhập bằng `dangerouslySetInnerHTML` nếu chưa sanitize.
- Dùng parameterized query qua Prisma.

## 7. Upload media

- Whitelist MIME: JPEG, PNG, WebP; SVG chỉ khi có quy trình sanitize rõ.
- Giới hạn kích thước và số lượng ảnh.
- Tên object sinh bởi server, không dùng tên file client làm path tin cậy.
- Môi trường đầu tiên dùng Vercel Blob; không lưu media lâu dài trong filesystem Vercel.
- Signed URL có thời hạn ngắn.
- Xác minh metadata sau upload nếu cần.
- Không cho upload executable/public HTML.

## 8. Public contact form

- Rate limit theo IP/store.
- Honeypot hoặc CAPTCHA khi có dấu hiệu spam.
- Validate số điện thoại và độ dài message.
- Không phản hồi thông tin cho biết số điện thoại/email đã tồn tại.
- Log tối thiểu; có chính sách lưu trữ/xóa PII.
- Gửi email notification qua provider transactional sau khi lead transaction commit; lỗi gửi không được làm mất lead.
- Anonymize PII lead sau 12 tháng bằng job idempotent; giữ metadata tối thiểu.

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
