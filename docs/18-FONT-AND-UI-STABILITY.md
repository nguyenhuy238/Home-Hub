# Font và độ ổn định giao diện

## Quyết định

HomeHub không tải font từ Google Fonts, CDN hoặc nguồn bên ngoài. Website dùng font stack hệ thống để tránh lỗi khi build/deploy, tránh layout shift và bảo đảm hiển thị tiếng Việt trên các môi trường phổ biến.

| Vai trò | Font stack |
| --- | --- |
| Nội dung | `Segoe UI`, `Noto Sans`, `Arial`, `sans-serif` |
| Tiêu đề | `Georgia`, `Times New Roman`, `Noto Serif`, `DejaVu Serif`, `serif` |
| Mã/kỹ thuật | `Cascadia Mono`, `Segoe UI Mono`, `Noto Sans Mono`, `monospace` |

## Quy tắc triển khai

- Không thêm `@import` font từ mạng hoặc gọi `next/font` nếu chưa có quyết định đóng gói font local.
- Không đặt tên font thương hiệu vào CSS nếu font đó chưa được commit vào repository.
- Nội dung tiếng Việt phải được lưu bằng UTF-8; không dùng chuỗi đã encode sẵn trong JSX/TSX.
- Các trang phải dùng token `var(--font-body)` hoặc `var(--font-display)` thay vì ghi đè bằng font không tồn tại.
- Khi thêm font local trong tương lai, cần kiểm tra đủ glyph tiếng Việt, font-weight được khai báo và kết quả `pnpm build` trên môi trường sạch.

## Kiểm tra nhanh

```powershell
rg -n "DM Sans|DM Serif Display|JetBrains Mono|@import.*font|fonts\.googleapis" apps/web DESIGN.md
corepack pnpm --filter @homehub/web lint
corepack pnpm --filter @homehub/web build
```

Lệnh `rg` không được trả về tham chiếu font ngoài danh sách hệ thống. Lint và build phải hoàn tất không có lỗi TypeScript/CSS.
