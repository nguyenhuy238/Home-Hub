import { ArrowUpRight, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ContactForm } from './ContactForm';
import { ProductCard } from './ProductCard';
import { StoreHeader, StoreNav } from './StoreHeader';
import { getCategories, getProducts, getStore } from '../../../lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const response = await getStore(storeSlug);
  return { title: response?.data ? `${response.data.name} · HomeHub` : 'Cửa hàng · HomeHub', description: response?.data?.description ?? 'Catalogue sản phẩm trên HomeHub' };
}

export default async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const storeResponse = await getStore(storeSlug);
  if (!storeResponse) notFound();
  if (storeResponse.meta.canonicalSlug !== storeSlug) permanentRedirect(`/cua-hang/${storeResponse.meta.canonicalSlug}`);
  const store = storeResponse.data;
  if (store.status === 'SUSPENDED') return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="suspended-state"><p className="eyebrow">THÔNG BÁO CỬA HÀNG</p><h2>Catalogue đang tạm ngưng hiển thị.</h2><p>{store.suspensionNotice ?? 'Vui lòng quay lại sau hoặc liên hệ trực tiếp với cửa hàng.'}</p></section></main>;
  const [productsResponse, categoriesResponse] = await Promise.all([getProducts(storeSlug, 'pageSize=6&featured=true'), getCategories(storeSlug)]);
  const products = productsResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];
  return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="store-hero"><div><p className="eyebrow">CHỌN ĐIỀU PHÙ HỢP CHO KHÔNG GIAN CỦA BẠN</p><h2>Những lựa chọn được cửa hàng tuyển chọn.</h2><p>{store.description ?? 'Khám phá sản phẩm, chất liệu và dịch vụ phù hợp cho ngôi nhà của bạn.'}</p><div className="hero-actions"><a className="primary-button" href={`#san-pham`}>Xem sản phẩm <ArrowUpRight size={16} /></a>{store.phone && <a className="quiet-link" href={`tel:${store.phone}`}>Gọi tư vấn</a>}</div></div>{store.bannerUrl ? <img className="store-banner" src={store.bannerUrl} alt={`Không gian của ${store.name}`} /> : <div className="hero-note"><Sparkles size={20} /><span>Thiết kế, vật liệu và dịch vụ cho một không gian có cá tính.</span></div>}</section><section id="san-pham" className="store-section"><div className="section-heading"><div><p className="eyebrow">DANH MỤC NỔI BẬT</p><h2>Sản phẩm được quan tâm</h2></div><a className="text-link" href={`/cua-hang/${store.slug}/san-pham`}>Xem tất cả <ArrowUpRight size={15} /></a></div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} storeSlug={store.slug} product={product} />)}</div> : <div className="empty-state"><p>Danh mục sản phẩm đang được cập nhật.</p></div>}</section><section className="category-strip"><div><p className="eyebrow">KHÁM PHÁ THEO NHÓM</p><h2>Đi từ nhu cầu của bạn.</h2></div><div className="category-list">{categories.slice(0, 6).map((category) => <a key={category.id} href={`/cua-hang/${store.slug}/san-pham?categorySlug=${encodeURIComponent(category.slug)}`}>{category.name}<ArrowUpRight size={15} /></a>)}</div></section><section id="lien-he" className="contact-section"><div className="contact-copy"><p className="eyebrow">CẦN TƯ VẤN?</p><h2>Gửi nhu cầu, cửa hàng sẽ giúp bạn chọn đúng.</h2><p><MessageCircle size={17} /> Không cần đặt hàng ngay. Hãy bắt đầu bằng một câu hỏi.</p>{store.phone && <p><MapPin size={17} /> Liên hệ trực tiếp: <a href={`tel:${store.phone}`}>{store.phone}</a></p>}</div><ContactForm storeSlug={store.slug} /></section></main>;
}
