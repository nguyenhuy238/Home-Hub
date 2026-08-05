export type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
export type PriceType = 'FIXED' | 'CONTACT' | 'FROM' | 'RANGE';
export type ContactRequestStatus = 'NEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';
export type ContactNotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PublicStore {
  name: string;
  slug: string;
  status: Extract<StoreStatus, 'ACTIVE' | 'SUSPENDED'>;
  suspensionNotice: string | null;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
}

export interface PublicProductSummary {
  id: string;
  name: string;
  slug: string;
  priceType: PriceType;
  price: number | null;
  currency: 'VND';
  thumbnailUrl: string | null;
  publicationStatus: 'PUBLISHED';
}

export interface PublicServiceSummary extends PublicProductSummary {
  coverImageUrl: string | null;
}
