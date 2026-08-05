# 13 — Non-Functional Requirements

## Performance

- Public pages sử dụng SSR/ISR phù hợp và CDN cho ảnh.
- API danh sách luôn pagination.
- Mục tiêu ban đầu: p95 API đọc phổ biến dưới 500 ms trong môi trường staging với dữ liệu demo hợp lý, không tính độ trễ dịch vụ bên ngoài.
- Ảnh có responsive sizes, lazy loading và định dạng tối ưu.

## Availability và resilience

- Health/readiness checks.
- Timeout cho external storage/provider.
- Lỗi provider không làm lộ stack trace.
- Backup database và restore procedure.

## Scalability

- Web/API stateless trong khả năng có thể.
- Session/token không phụ thuộc memory của một instance.
- Object storage tách khỏi container.
- Index theo store và trạng thái.

## Maintainability

- TypeScript strict.
- Modular monolith với ownership rõ.
- OpenAPI contract.
- Migration versioned.
- ADR cho quyết định lớn.
- CI quality gates.

## Accessibility

- Các luồng chính sử dụng được bằng bàn phím.
- Input có label.
- Focus rõ.
- Alt text.
- Contrast đủ.

## Privacy

- Thu thập tối thiểu dữ liệu liên hệ.
- Hạn chế người có quyền xem lead.
- Không bán/chia sẻ dữ liệu tenant cho tenant khác.
- Chuẩn bị chính sách retention/xóa dữ liệu khi triển khai thực tế.

## Compatibility

- Hỗ trợ các phiên bản trình duyệt hiện đại phổ biến trên desktop/mobile.
- Progressive enhancement cho các CTA liên hệ cơ bản.
