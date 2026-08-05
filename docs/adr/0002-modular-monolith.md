# ADR-0002 — Modular Monolith

- Status: Accepted

## Context

Nhóm nhỏ/sinh viên cần tốc độ triển khai, transaction đơn giản và vận hành dễ. Microservices tạo thêm chi phí mạng, deploy, observability và consistency.

## Decision

Backend là một NestJS modular monolith với module nghiệp vụ rõ ràng.

## Consequences

- Dễ local development, test và deploy.
- Transaction đơn giản.
- Cần kỷ luật module boundary để tránh “big ball of mud”.

## Revisit when

- Một module có tải/vòng đời deploy độc lập rõ ràng.
- Có đội ngũ vận hành và observability phù hợp.
- Chi phí tách service thấp hơn chi phí tiếp tục monolith.
