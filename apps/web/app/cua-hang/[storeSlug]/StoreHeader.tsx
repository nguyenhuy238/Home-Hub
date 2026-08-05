import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Phone } from 'lucide-react';
import type { Store } from '../../../lib/api';

export function StoreHeader({ store }: { store: Store }) {
  return (
    <header className="store-header">
      <Link href="/" className="back-link"><ArrowLeft size={15} /> HomeHub</Link>
      <div className="store-identity">
        {store.logoUrl ? <img className="store-logo" src={store.logoUrl} alt={`Logo ${store.name}`} /> : <span className="store-monogram">{store.name.slice(0, 1)}</span>}
        <div><p className="eyebrow">CATALOGUE CỬA HÀNG</p><h1>{store.name}</h1></div>
      </div>
      {store.phone ? <a className="phone-link" href={`tel:${store.phone}`}><Phone size={15} /> {store.phone}</a> : <span className="store-status">{store.slug}</span>}
    </header>
  );
}

export function StoreNav({ store }: { store: Store }) {
  return <nav className="store-nav" aria-label="Điều hướng cửa hàng"><Link href={`/cua-hang/${store.slug}`}>Trang chủ</Link><Link href={`/cua-hang/${store.slug}/san-pham`}>Sản phẩm</Link><Link href={`/cua-hang/${store.slug}/dich-vu`}>Dịch vụ</Link><Link href={`/cua-hang/${store.slug}#lien-he`}>Liên hệ <ArrowUpRight size={14} /></Link></nav>;
}
