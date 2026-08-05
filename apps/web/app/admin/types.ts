export type Category = { id: string; name: string; slug: string; status: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: string;
  priceType: string;
  price: string | number | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
  shortDescription: string | null;
  descriptionHtml: string;
  stockStatus: string;
  isFeatured: boolean;
  categories?: Array<{ category: Category }>;
};

export type Lead = {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  status: string;
  createdAt: string;
  product: { name: string } | null;
};

export type StoreSettings = {
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoKey: string | null;
  bannerKey: string | null;
  zaloUrl: string | null;
  facebookUrl: string | null;
  mapUrl: string | null;
};

export type Context = {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings: StoreSettings | null;
};

export type AdminService = {
  id: string;
  name: string;
  shortDescription: string | null;
  descriptionHtml: string;
  priceType: string;
  price: string | number | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
  publicationStatus: string;
  isFeatured: boolean;
};
