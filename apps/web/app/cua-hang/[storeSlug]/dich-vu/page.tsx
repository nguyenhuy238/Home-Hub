import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { StoreHeader, StoreNav } from '../StoreHeader';
import { formatPrice, getServices, getStore } from '../../../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const storeResponse = await getStore(storeSlug);
  if (!storeResponse) notFound();
  if (storeResponse.meta.canonicalSlug !== storeSlug) permanentRedirect(`/cua-hang/${storeResponse.meta.canonicalSlug}/dich-vu`);
  const store = storeResponse.data;
  if (store.status === 'SUSPENDED') return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="suspended-state"><p className="eyebrow">THÔNG BÁO CỬA HÀNG</p><h2>Catalogue đang tạm ngưng hiển thị.</h2><p>{store.suspensionNotice ?? 'Vui lòng quay lại sau.'}</p></section></main>;
  const response = await getServices(store.slug);
  const services = response?.data ?? [];
  return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="catalog-heading"><a className="back-link" href={`/cua-hang/${store.slug}`}><ArrowLeft size={15} /> Về trang cửa hàng</a><p className="eyebrow">DỊCH VỤ</p><h2>Giải pháp đi cùng sản phẩm.</h2><p>Từ tư vấn đến hoàn thiện, hãy nói với cửa hàng điều bạn đang cần.</p></section><section className="service-list">{services.length ? services.map((service) => <article className="service-row" key={service.id}>{service.coverImageUrl ? <img src={service.coverImageUrl} alt={service.name} /> : <div className="service-marker">{service.name.slice(0, 1)}</div>}<div className="service-body"><p className="eyebrow">DỊCH VỤ</p><h3>{service.name}</h3><p>{service.shortDescription}</p><div className="service-footer"><span>{formatPrice(service)}</span><a href={`/cua-hang/${store.slug}#lien-he`}>Hỏi thêm <ArrowUpRight size={15} /></a></div></div></article>) : <div className="empty-state"><p>Dịch vụ đang được cập nhật.</p></div>}</section></main>;
}
