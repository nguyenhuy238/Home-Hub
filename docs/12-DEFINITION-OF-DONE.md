# 12 — Definition of Done

Một user story/task được coi là hoàn thành khi thỏa tất cả mục liên quan.

## Chức năng

- Đạt acceptance criteria.
- Xử lý happy path, empty state và lỗi chính.
- Không thực hiện tính năng ngoài phạm vi.

## Kiến trúc

- Nằm đúng module.
- Controller mỏng.
- Không tạo circular dependency.
- Không gọi Prisma tùy tiện ngoài data layer được chấp thuận.

## Multi-tenant và security

- Tenant context là trusted server context.
- Mọi tenant query scoped bằng `store_id`.
- Role guard đúng.
- Input validated.
- Output không lộ dữ liệu nội bộ.
- Cross-tenant test có hoặc được cập nhật.

## Database

- Có migration nếu schema thay đổi.
- Constraint/index phù hợp.
- Có transaction khi cần.
- Không sửa migration lịch sử đã dùng.

## API

- Endpoint/DTO/error code nhất quán.
- OpenAPI cập nhật.
- Không breaking change không được ghi nhận.

## Frontend

- Loading/empty/error/success state.
- Responsive.
- Form có label và validation.
- Không lộ lỗi kỹ thuật thô cho người dùng.

## Quality

- Lint và typecheck thành công.
- Test liên quan thành công.
- Build phần bị ảnh hưởng thành công.
- Không có secret hoặc debug code.

## Documentation

- README/architecture/API/schema/ADR được cập nhật nếu thay đổi quyết định hoặc contract.
- Summary nêu rõ test đã chạy và phần chưa hoàn thành.
