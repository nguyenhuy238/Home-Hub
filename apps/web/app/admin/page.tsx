'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LogOut, Plus, RefreshCw, Send, Store, Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
type Category = { id: string; name: string; slug: string; status: string };
type Product = { id: string; name: string; slug: string; publicationStatus: string; priceType: string; price: string | number | null; categories?: Array<{ category: Category }> };
type Lead = { id: string; customerName: string; customerPhone: string; message: string; status: string; createdAt: string; product: { name: string } | null };
type Context = { id: string; name: string; slug: string; status: string; settings: { description: string | null; phone: string | null } | null };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const isMultipart = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, { ...options, credentials: 'include', headers: { ...(isMultipart ? {} : { 'Content-Type': 'application/json' }), ...(options?.headers ?? {}) } });
  if (response.status === 401 || response.status === 403) throw new Error('unauthorized');
  if (!response.ok) throw new Error('request-failed');
  const body = await response.json() as { data: T };
  return body.data;
}

export default function AdminPage() {
  const [context, setContext] = useState<Context | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [storeContext, categoryData, productResponse, leadResponse] = await Promise.all([api<Context>('/admin/context'), api<Category[]>('/admin/categories'), api<{ data: Product[]; meta: unknown }>('/admin/products'), api<{ data: Lead[]; meta: unknown }>('/admin/contact-requests')]);
      setContext(storeContext); setCategories(categoryData); setProducts(productResponse.data); setLeads(leadResponse.data); setNotice('');
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'unauthorized' ? 'Phiên đăng nhập đã hết hạn.' : 'Chưa tải được dữ liệu. Kiểm tra API và thử lại.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function logout() { await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }); window.location.href = '/admin/login'; }
  async function deleteProduct(id: string) { if (!window.confirm('Ẩn sản phẩm này khỏi catalog?')) return; await api(`/admin/products/${id}`, { method: 'DELETE' }); await load(); }
  async function updateLead(id: string, status: string) { await api(`/admin/contact-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); }

  if (loading) return <main className="admin-shell"><div className="admin-loading"><RefreshCw className="spin" size={18} /> Đang tải workspace...</div></main>;
  return <main className="admin-shell"><header className="admin-header"><div><Link className="wordmark" href="/">HomeHub</Link><span className="admin-divider">/</span><span className="admin-muted">Workspace cửa hàng</span></div><div className="admin-actions"><button className="quiet-button" onClick={() => void load()}><RefreshCw size={15} /> Làm mới</button><button className="quiet-button" onClick={() => void logout()}><LogOut size={15} /> Đăng xuất</button></div></header>{notice && <div className="admin-notice">{notice} <Link href="/admin/login">Đăng nhập lại</Link></div>}{context && <><section className="admin-intro"><div><p className="eyebrow">OWNER WORKSPACE</p><h1>{context.name}</h1><p className="admin-muted">/{context.slug} · {context.status === 'ACTIVE' ? 'Đang hiển thị' : 'Đang tạm ngưng'}</p></div><Link className="primary-button" href={`/cua-hang/${context.slug}`} target="_blank">Xem storefront <ArrowUpRight size={16} /></Link></section><section className="admin-grid"><div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">CATALOG</p><h2>Sản phẩm</h2></div><ProductForm categories={categories} onCreated={load} /></div>{products.length ? <div className="admin-table">{products.map((product) => <div className="admin-row" key={product.id}><div><strong>{product.name}</strong><small>{product.publicationStatus} · {product.priceType}</small></div><button className="icon-button" onClick={() => void deleteProduct(product.id)} aria-label={`Ẩn ${product.name}`}><Trash2 size={16} /></button></div>)}</div> : <p className="admin-muted">Chưa có sản phẩm. Tạo sản phẩm đầu tiên để storefront có nội dung.</p>}</div><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">TAXONOMY</p><h2>Danh mục</h2></div><CategoryForm onCreated={load} /></div>{categories.length ? <div className="admin-table">{categories.map((category) => <div className="admin-row" key={category.id}><div><strong>{category.name}</strong><small>/{category.slug}</small></div><span className="status-dot">{category.status}</span></div>)}</div> : <p className="admin-muted">Chưa có danh mục.</p>}</div><div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">CONTACT REQUESTS</p><h2>Yêu cầu liên hệ</h2></div><span className="panel-count">{leads.length}</span></div>{leads.length ? <div className="admin-table">{leads.map((lead) => <div className="admin-row lead-row" key={lead.id}><div><strong>{lead.customerName}{lead.product ? ` · ${lead.product.name}` : ''}</strong><small>{lead.customerPhone} · {new Date(lead.createdAt).toLocaleDateString('vi-VN')}<br />{lead.message}</small></div><select value={lead.status} onChange={(event) => void updateLead(lead.id, event.target.value)}><option value="NEW">Mới</option><option value="CONTACTED">Đã liên hệ</option><option value="COMPLETED">Hoàn tất</option><option value="CANCELLED">Đã hủy</option></select></div>)}</div> : <p className="admin-muted">Chưa có yêu cầu liên hệ.</p>}</div><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">STORE PROFILE</p><h2>Thông tin cửa hàng</h2></div><Store size={18} /></div><p className="admin-muted">{context.settings?.description ?? 'Chưa có mô tả cửa hàng.'}</p><p className="admin-muted">{context.settings?.phone ?? 'Chưa có số điện thoại.'}</p><Link className="text-link" href="/admin">Chỉnh sửa sau <ArrowUpRight size={15} /></Link></div></section></>}</main>;
}

function CategoryForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState('');
  async function submit(event: FormEvent) { event.preventDefault(); await api('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }); setName(''); setOpen(false); await onCreated(); }
  if (!open) return <button className="small-button" onClick={() => setOpen(true)}><Plus size={15} /> Thêm</button>;
  return <form className="inline-form" onSubmit={submit}><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên danh mục" required /><button className="small-button" type="submit"><Check size={15} /></button></form>;
}

function ProductForm({ categories, onCreated }: { categories: Category[]; onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [priceType, setPriceType] = useState('CONTACT'); const [price, setPrice] = useState(''); const [categoryId, setCategoryId] = useState(''); const [image, setImage] = useState<File | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); const created = await api<Product>('/admin/products', { method: 'POST', body: JSON.stringify({ name, priceType, price: price || undefined, categoryIds: categoryId ? [categoryId] : [], publicationStatus: 'DRAFT' }) }); if (image) { const form = new FormData(); form.append('file', image); form.append('altText', name); form.append('isPrimary', 'true'); await api(`/admin/products/${created.id}/images`, { method: 'POST', body: form }); } setName(''); setPrice(''); setImage(null); setOpen(false); await onCreated(); }
  if (!open) return <button className="small-button" onClick={() => setOpen(true)}><Plus size={15} /> Thêm sản phẩm</button>;
  return <form className="product-form" onSubmit={submit}><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên sản phẩm" required /><select value={priceType} onChange={(event) => setPriceType(event.target.value)}><option value="CONTACT">Liên hệ</option><option value="FIXED">Giá cố định</option><option value="FROM">Từ giá</option></select>{priceType !== 'CONTACT' && <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Giá VND" inputMode="numeric" />}{categories.length > 0 && <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>}<label className="file-button">Ảnh<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} /></label><button className="small-button" type="submit"><Send size={15} /> Lưu nháp</button></form>;
}
