import { ArrowLeft, CheckCircle2, PackageOpen } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ContactForm } from '../../ContactForm';
import { StoreHeader, StoreNav } from '../../StoreHeader';
import { formatPrice, getProduct, getStore } from '../../../../../lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string; productSlug: string }> }) {
  const { storeSlug, productSlug } = await params;
  const [storeResponse, productResponse] = await Promise.all([getStore(storeSlug), getProduct(storeSlug, productSlug)]);
  return { title: productResponse?.data ? `${productResponse.data.name} · ${storeResponse?.data.name ?? 'HomeHub'}` : 'Sản phẩm · HomeHub', description: productResponse?.data.shortDescription ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ storeSlug: string; productSlug: string }> }) {
  const { storeSlug, productSlug } = await params;
  const storeResponse = await getStore(storeSlug);
  if (!storeResponse) notFound();
  if (storeResponse.meta.canonicalSlug !== storeSlug) permanentRedirect(`/cua-hang/${storeResponse.meta.canonicalSlug}/san-pham/${productSlug}`);
  const store = storeResponse.data;
  if (store.status === 'SUSPENDED') return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><section className="suspended-state"><p className="eyebrow">THÔNG BÁO CỬA HÀNG</p><h2>Catalogue đang tạm ngưng hiển thị.</h2><p>{store.suspensionNotice ?? 'Vui lòng quay lại sau.'}</p></section></main>;
  const productResponse = await getProduct(store.slug, productSlug);
  if (!productResponse) notFound();
  const product = productResponse.data;
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return <main className="store-shell"><StoreHeader store={store} /><StoreNav store={store} /><div className="detail-back"><a className="back-link" href={`/cua-hang/${store.slug}/san-pham`}><ArrowLeft size={15} /> Tất cả sản phẩm</a></div><section className="product-detail"><div className="detail-gallery">{primaryImage?.url ? <img src={primaryImage.url} alt={primaryImage.altText || product.name} /> : <div className="detail-placeholder"><PackageOpen size={30} /><span>Chưa có hình ảnh</span></div>}</div><div className="detail-copy"><p className="eyebrow">{product.brand?.name ?? 'SẢN PHẨM'}</p><h2>{product.name}</h2>{product.sku && <p className="sku">Mã sản phẩm: {product.sku}</p>}<p className="detail-price">{formatPrice(product)}</p>{product.shortDescription && <p className="detail-lede">{product.shortDescription}</p>}<div className="availability"><CheckCircle2 size={16} /> {product.stockStatus === 'IN_STOCK' ? 'Đang có sẵn' : product.stockStatus === 'PREORDER' ? 'Nhận đặt trước' : 'Liên hệ để kiểm tra'}</div><a className="primary-button" href="#lien-he">Hỏi về sản phẩm</a></div></section><section className="detail-content"><article><p className="eyebrow">THÔNG TIN CHI TIẾT</p><div className="rich-content" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} /></article>{product.attributes.length > 0 && <aside><p className="eyebrow">THÔNG SỐ</p><dl className="attribute-list">{product.attributes.map((attribute) => <div key={attribute.code}><dt>{attribute.name}</dt><dd>{attribute.text ?? attribute.number ?? (attribute.boolean === null ? '—' : attribute.boolean ? 'Có' : 'Không')}</dd></div>)}</dl></aside>}</section><section id="lien-he" className="contact-section product-contact"><div className="contact-copy"><p className="eyebrow">HỎI VỀ SẢN PHẨM</p><h2>Để lại thông tin, cửa hàng sẽ tư vấn cho bạn.</h2></div><ContactForm storeSlug={store.slug} productSlug={product.slug} /></section></main>;
}
