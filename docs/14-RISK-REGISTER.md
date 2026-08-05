# 14 — Risk Register

| ID | Rủi ro | Tác động | Khả năng | Giảm thiểu |
|---|---|---|---|---|
| R-01 | Truy cập chéo tenant | Rất cao | Trung bình | Trusted tenant context, repository scoping, test A/B bắt buộc |
| R-02 | Phạm vi phình sang e-commerce | Cao | Cao | Giữ out-of-scope rõ, chỉ thêm qua ADR/roadmap |
| R-03 | Ảnh làm chậm trang | Cao | Cao | Object storage/CDN, resize, WebP/AVIF, lazy loading |
| R-04 | AI tạo code thiếu nhất quán | Cao | Cao | AGENTS.md, task nhỏ, review checklist, CI |
| R-05 | Schema thuộc tính sản phẩm quá phức tạp | Trung bình | Cao | MVP definition/value tối giản; không over-engineer filter |
| R-06 | Mất dữ liệu do migration/deploy | Rất cao | Thấp-Trung bình | Backup, staging, backward-compatible migration, rollback plan |
| R-07 | Spam contact form | Trung bình | Cao | Rate limit, honeypot/CAPTCHA, validation |
| R-08 | Token bị lộ qua frontend/log | Rất cao | Thấp-Trung bình | HttpOnly cookie/session, redaction, secret scanning |
| R-09 | Dự án khó hoàn thành do stack quá nặng | Cao | Trung bình | Modular monolith, không microservices, milestone nhỏ |
| R-10 | SEO/social preview sai | Trung bình | Trung bình | SSR metadata, public URL tests, preview verification |
