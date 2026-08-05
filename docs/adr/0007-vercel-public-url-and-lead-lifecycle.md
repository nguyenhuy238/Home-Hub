# ADR-0007 — Vercel deployment, public URL and lead lifecycle

- Status: Accepted
- Decision date: 2026-08-05

## Decision

- Giai đoạn đầu deploy web/API trên Vercel.
- Media dùng Vercel Blob; database vẫn là PostgreSQL managed bên ngoài Vercel.
- Public URL MVP dùng subpath `/cua-hang/{storeSlug}`.
- Owner được đổi store slug; slug cũ được lưu trong `store_slug_aliases` và trả redirect 301.
- Custom domain là phase sau MVP, dùng domain mapping/verification của Vercel.
- Lead gửi email notification ngay sau khi transaction tạo thành công; baseline provider là Resend.
- Sau 12 tháng, job định kỳ anonymize PII lead; giữ trạng thái, thời gian và metadata tối thiểu.

## Consequences

- Cần `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY` và cấu hình sender trong environment.
- Cần retry/idempotency cho email notification và observability cho provider failure.
- Cần scheduled job (Vercel Cron hoặc worker tương đương) cho anonymization.
- Không dùng filesystem local của Vercel để lưu ảnh lâu dài.
