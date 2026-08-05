import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '../../../lib/api';
import { formatPrice } from '../../../lib/api';

export function ProductCard({ storeSlug, product }: { storeSlug: string; product: Product }) {
  return <article className="product-card"><Link className="product-image" href={`/cua-hang/${storeSlug}/san-pham/${product.slug}`}>{product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} /> : <span>Hình ảnh sản phẩm</span>}</Link><div className="product-card-body"><div><p className="product-label">{product.priceType === 'CONTACT' ? 'TƯ VẤN' : 'SẢN PHẨM'}</p><h3><Link href={`/cua-hang/${storeSlug}/san-pham/${product.slug}`}>{product.name}</Link></h3><p className="price">{formatPrice(product)}</p></div><Link className="icon-link" href={`/cua-hang/${storeSlug}/san-pham/${product.slug}`} aria-label={`Xem ${product.name}`}><ArrowUpRight size={17} /></Link></div></article>;
}
