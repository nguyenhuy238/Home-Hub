# ADR-0006 — Catalog content, categories and pricing

- Status: Accepted
- Decision date: 2026-08-05

## Decision

- Product có thể thuộc nhiều category qua bảng nối `product_categories`.
- Product attributes dùng `product_attribute_definitions` và `product_attribute_values`.
- Mô tả catalog dùng rich-text editor; server sanitize nội dung theo allowlist trước khi lưu/render.
- Giá dùng `FIXED`, `FROM`, `RANGE`, `CONTACT`; currency MVP cố định VND và lưu Decimal/numeric.
- Service là catalog item phi vật lý, không bắt buộc SKU hoặc tồn kho.

## Consequences

- Repository phải kiểm tra mọi category/attribute cùng `store_id`.
- Publish product yêu cầu tối thiểu một category hợp lệ; query filter category dùng join.
- Rich text cần test XSS và snapshot output sau sanitize.
- Không thêm currency selector hoặc JSON schema attributes tùy ý trong MVP.
