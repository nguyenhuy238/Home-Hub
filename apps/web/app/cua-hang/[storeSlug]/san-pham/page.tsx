import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ProductCard } from '../ProductCard';
import { StoreHeader, StoreNav } from '../StoreHeader';
import { getCategories, getProducts, getStore } from '../../../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ storeSlug: string }>; searchParams: Promise<{ categorySlug?: string }> }) {
  const { storeSlug } = await params;
  const { categorySlug } = await searchParams;
  const storeResponse = await getStore(storeSlug);
  if (!storeResponse) notFound();
  if (storeResponse.meta.canonicalSlug !== storeSlug) permanentRedirect(`/cua-hang/${storeResponse.meta.canonicalSlug}/san-pham`);
  const store = storeResponse.data;
  if (store.status === 'SUSPENDED') return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="suspended-state"><p className="eyebrow">THÔNG BÁO CỬA HÀNG</p><h2>Catalogue đang tạm ngưng hiển thị.</h2><p>{store.suspensionNotice ?? 'Vui lòng quay lại sau.'}</p></section></main>;
  const query = new URLSearchParams({ pageSize: '24' });
  if (categorySlug) query.set('categorySlug', categorySlug);
  const [productsResponse, categoriesResponse] = await Promise.all([getProducts(store.slug, query.toString()), getCategories(store.slug)]);
  const products = productsResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];
  return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="catalog-heading"><a className="back-link" href={`/cua-hang/${store.slug}`}><ArrowLeft size={15} /> Về trang cửa hàng</a><p className="eyebrow">CATALOGUE SẢN PHẨM</p><h2>{categorySlug ? categories.find((category) => category.slug === categorySlug)?.name ?? 'Sản phẩm' : 'Tất cả sản phẩm'}</h2><p>Chọn sản phẩm để xem thông tin chi tiết hoặc gửi yêu cầu tư vấn.</p></section><section className="catalog-layout"><aside className="catalog-filters"><p><SlidersHorizontal size={16} /> Lọc theo danh mục</p><a className={!categorySlug ? 'active' : ''} href={`/cua-hang/${store.slug}/san-pham`}>Tất cả sản phẩm</a>{categories.map((category) => <a className={category.slug === categorySlug ? 'active' : ''} key={category.id} href={`/cua-hang/${store.slug}/san-pham?categorySlug=${encodeURIComponent(category.slug)}`}>{category.name}</a>)}</aside><div className="catalog-results"><div className="results-meta"><span>{productsResponse?.meta.total ?? 0} sản phẩm</span></div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} storeSlug={store.slug} product={product} />)}</div> : <div className="empty-state"><p>Chưa có sản phẩm phù hợp với bộ lọc này.</p></div>}</div></section></main>;
}
