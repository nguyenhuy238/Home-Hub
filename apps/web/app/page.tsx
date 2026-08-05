import Link from 'next/link';
import { ArrowUpRight, Boxes, Store } from 'lucide-react';

export default function HomePage(): React.ReactNode {
  return (
    <main className="landing-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">HomeHub</Link>
        <span className="header-note">CATALOGUE PLATFORM · MVP</span>
      </header>
      <section className="intro-grid">
        <div className="intro-copy">
          <p className="kicker">NỀN TẢNG GIỚI THIỆU CỬA HÀNG</p>
          <h1>Mỗi cửa hàng một địa chỉ để khách dễ xem, dễ hỏi.</h1>
          <p className="lede">HomeHub giúp cửa hàng nội thất, thiết bị nhà vệ sinh, gạch men và dịch vụ tạo catalog riêng để chia sẻ từ Facebook, Zalo hoặc bất kỳ kênh nào.</p>
          <Link className="primary-link" href="/cua-hang/demo">Xem cửa hàng demo <ArrowUpRight size={16} /></Link>
        </div>
        <div className="intro-index" aria-label="HomeHub capabilities">
          <div className="index-row"><Store size={18} /><span>Storefront riêng</span><small>01</small></div>
          <div className="index-row"><Boxes size={18} /><span>Catalog dễ quản lý</span><small>02</small></div>
          <div className="index-row"><ArrowUpRight size={18} /><span>Liên hệ nhanh</span><small>03</small></div>
        </div>
      </section>
      <footer className="site-footer"><span>HomeHub / Foundation</span><span>Đang phát triển</span></footer>
    </main>
  );
}
