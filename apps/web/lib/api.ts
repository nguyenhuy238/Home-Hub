const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000';

export type Store = {
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  suspensionNotice: string | null;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceType: 'FIXED' | 'CONTACT' | 'FROM' | 'RANGE';
  price: number | null;
  currency: 'VND';
  thumbnailUrl: string | null;
  publicationStatus: 'PUBLISHED';
};

export type ProductDetail = Product & {
  sku: string | null;
  shortDescription: string | null;
  descriptionHtml: string;
  stockStatus: string;
  brand: { name: string; slug: string } | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  images: Array<{ id: string; url: string | null; altText: string; isPrimary: boolean; sortOrder: number }>;
  attributes: Array<{ name: string; code: string; dataType: string; text: string | null; number: number | null; boolean: boolean | null; json: unknown }>;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  descriptionHtml: string;
  priceType: Product['priceType'];
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: 'VND';
  coverImageUrl: string | null;
  publicationStatus: 'PUBLISHED';
};

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${path}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function getStore(storeSlug: string) {
  return getJson<{ data: Store; meta: { canonicalSlug: string; aliasMatched: boolean } }>(`/public/stores/${encodeURIComponent(storeSlug)}`);
}

export function getCategories(storeSlug: string) {
  return getJson<{ data: Array<{ id: string; name: string; slug: string; description: string | null; imageUrl: string | null; parentId: string | null }> }>(`/public/stores/${encodeURIComponent(storeSlug)}/categories`);
}

export function getProducts(storeSlug: string, query = '') {
  return getJson<{ data: Product[]; meta: { page: number; pageSize: number; total: number; totalPages: number } }>(`/public/stores/${encodeURIComponent(storeSlug)}/products${query ? `?${query}` : ''}`);
}

export function getProduct(storeSlug: string, productSlug: string) {
  return getJson<{ data: ProductDetail }>(`/public/stores/${encodeURIComponent(storeSlug)}/products/${encodeURIComponent(productSlug)}`);
}

export function getServices(storeSlug: string) {
  return getJson<{ data: Service[] }>(`/public/stores/${encodeURIComponent(storeSlug)}/services`);
}

export function formatVnd(value: number | null) {
  if (value === null) return 'Liên hệ để nhận báo giá';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export function formatPrice(item: Pick<Product, 'priceType' | 'price'> & Partial<Pick<Service, 'minPrice' | 'maxPrice'>>) {
  if (item.priceType === 'CONTACT') return 'Liên hệ để nhận báo giá';
  if (item.priceType === 'FROM') return `Từ ${formatVnd(item.price)}`;
  if (item.priceType === 'RANGE' && item.minPrice !== undefined && item.maxPrice !== undefined) return `${formatVnd(item.minPrice)} – ${formatVnd(item.maxPrice)}`;
  return formatVnd(item.price);
}
