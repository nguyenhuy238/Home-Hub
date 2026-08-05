# 17 — Implementation Status

## Đã triển khai

- Monorepo pnpm với `apps/api`, `apps/web`, `packages/contracts`.
- Prisma schema và migration `apps/api/prisma/migrations/0001_init`.
- Seed hai cửa hàng demo và tài khoản demo.
- Authentication cookie access/refresh, OWNER tenant context và platform store setup API.
- Category, product, product-category, rich-text sanitize, pricing validation và soft delete.
- Product image upload qua Vercel Blob; file chỉ nhận JPG/PNG/WebP, tối đa 4MB.
- Public storefront: store, category, product, service, contact request, slug alias và suspended notice.
- Admin UI tại `/admin/login` và `/admin`; owner có thể quản lý danh mục, tạo/chỉnh sửa/xuất bản sản phẩm với nhiều danh mục và rich-text editor, upload ảnh, quản lý dịch vụ, cập nhật settings/slug và xử lý lead.
- Owner có thể tạo/ẩn thương hiệu, tạo bộ định nghĩa thuộc tính theo danh mục và nhập giá trị TEXT/NUMBER/BOOLEAN/SELECT cho từng sản phẩm.
- Storefront hiển thị địa chỉ, email, Zalo, Facebook và link bản đồ khi cửa hàng cấu hình.
- Resend notification baseline, lead anonymization sau 12 tháng và cron endpoint.
- OpenAPI tại `/docs`, error response chuẩn có `requestId`, CORS và rate limit best-effort cho contact.

## Chạy local

```powershell
corepack pnpm install
Copy-Item .env.example .env
corepack pnpm --filter @homehub/api exec prisma generate
corepack pnpm --filter @homehub/api exec prisma migrate deploy
corepack pnpm --filter @homehub/api exec prisma db seed
```

Mở hai terminal:

```powershell
corepack pnpm --filter @homehub/api dev
corepack pnpm --filter @homehub/web dev
```

Sau đó mở `http://localhost:3000`, storefront demo ở
`/cua-hang/noi-that-an-nhien`, admin ở `/admin/login`.

Seed credentials chỉ dùng cho local demo:

- `owner-a@homehub.local` / `HomeHub123!`
- `owner-b@homehub.local` / `HomeHub123!`
- `admin@homehub.local` / `HomeHub123!`

## Environment production

Thiết lập PostgreSQL managed, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`,
`EMAIL_FROM`, hai JWT secret tối thiểu 32 ký tự, `CRON_SECRET`,
`CORS_ALLOWED_ORIGINS` và `NEXT_PUBLIC_API_BASE_URL`. Không dùng password seed
trong production.

Gọi `POST /api/v1/jobs/anonymize-leads` với header `x-cron-secret` từ Vercel
Cron hoặc scheduler tương đương.

## Kiểm tra đã chạy

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm build`
- PostgreSQL temporary cluster: migration, seed, health, public catalog, login,
  owner admin, lead, cross-tenant 404, slug alias và suspended behavior.

## Phần mở rộng sau MVP

- UI platform admin và chỉnh sửa nâng cao brand/attribute.
- Upload/gallery reorder và xóa blob vật lý khi xóa ProductImage.
- Rate limiting dùng Redis hoặc provider edge thay cho in-memory best effort.
- Custom domain mapping, analytics và order/checkout theo các quyết định mới.
