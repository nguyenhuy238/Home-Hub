# 07 — UI/UX Guidelines

## 1. Nguyên tắc

- Mobile-first vì khách chủ yếu mở từ Facebook/Zalo.
- Tập trung vào xem nhanh và liên hệ nhanh.
- Giao diện admin đơn giản, tránh thuật ngữ kỹ thuật.
- Mọi màn hình có trạng thái loading, empty, error và success.

## 2. Storefront

### Trang chủ cửa hàng

- Logo, banner, tên, mô tả ngắn.
- Nút gọi/Zalo dễ chạm.
- Danh mục nổi bật.
- Sản phẩm nổi bật/mới.
- Địa chỉ, giờ mở cửa, bản đồ.

### Danh sách sản phẩm

- Card có ảnh, tên, giá hoặc “Liên hệ”, nhãn nổi bật.
- Tìm kiếm và lọc danh mục.
- Pagination hoặc load more có kiểm soát.
- Không tải toàn bộ dữ liệu cùng lúc.

### Chi tiết sản phẩm

- Gallery ảnh.
- Tên, giá, trạng thái, mô tả, thông số.
- CTA cố định hợp lý trên mobile: Gọi ngay / Zalo / Yêu cầu tư vấn.
- Sản phẩm liên quan cùng tenant.

## 3. Admin

- Sidebar ngắn: Tổng quan, Sản phẩm, Danh mục, Liên hệ, Cửa hàng, Thành viên.
- Form chia section, không dồn toàn bộ vào một khối dài.
- Autosave không bắt buộc; hiển thị rõ trạng thái đã lưu/chưa lưu.
- Cảnh báo trước thao tác xóa/ẩn.
- Bảng hỗ trợ tìm kiếm, lọc, pagination.

## 4. Accessibility

- Keyboard navigation cơ bản.
- Focus state rõ.
- Label thật cho input.
- Alt text cho ảnh.
- Contrast đủ đọc.
- Không dùng màu làm tín hiệu duy nhất.
- Dialog có focus trap và đóng bằng Escape.

## 5. SEO và social preview

- Mỗi store/product có title/description riêng.
- Open Graph image tối thiểu rõ ràng, không méo.
- URL canonical:
  - `/cua-hang/{storeSlug}`
  - `/cua-hang/{storeSlug}/san-pham/{productSlug}`
- Metadata chỉ lấy từ nội dung đã xuất bản.

## 6. Design system

- Tailwind CSS + shadcn/ui.
- Token hóa spacing, radius, typography và semantic colors.
- Theme cửa hàng chỉ cho phép cấu hình giới hạn: màu chính, logo, banner; không cho CSS tùy ý trong MVP.
- Component form, button, badge, empty state, data table dùng chung.
- `DESIGN.md` ở root là nguồn sự thật về mood, token, macrostructure và anti-pattern.
- Storefront dùng nhịp Catalogue/product-grid; admin dùng Workbench/data-first, không dùng cùng một template hero cho mọi màn hình.
- Kiểm tra đủ 8 trạng thái của control tương tác và các breakpoint 320/375/414/768 trước khi nghiệm thu UI.
