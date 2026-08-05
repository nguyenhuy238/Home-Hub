'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LogOut, Plus, RefreshCw, Store, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import { ServiceManager } from './ServiceManager';
import { ProductForm } from './ProductForm';
import { StoreSettingsForm } from './StoreSettingsForm';
import { BrandManager } from './BrandManager';
import { AttributeManager } from './AttributeManager';
import { GalleryManager } from './GalleryManager';
import type { AdminService, AttributeDefinition, Brand, Category, Context, Lead, Product } from './types';

export default function AdminPage() {
  const [context, setContext] = useState<Context | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<AttributeDefinition[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [storeContext, categoryData, brandData, attributeData, productData, serviceData, leadData] = await Promise.all([
        adminApi<Context>('/admin/context'),
        adminApi<Category[]>('/admin/categories'),
        adminApi<Brand[]>('/admin/brands'),
        adminApi<AttributeDefinition[]>('/admin/attributes'),
        adminApi<Product[]>('/admin/products'),
        adminApi<AdminService[]>('/admin/services'),
        adminApi<Lead[]>('/admin/contact-requests'),
      ]);
      setContext(storeContext);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
      setAttributeDefinitions(Array.isArray(attributeData) ? attributeData : []);
      setProducts(Array.isArray(productData) ? productData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setLeads(Array.isArray(leadData) ? leadData : []);
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'unauthorized' ? 'Phiên đăng nhập đã hết hạn.' : 'Chưa tải được dữ liệu. Kiểm tra API và thử lại.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function logout() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    await fetch(`${apiBaseUrl}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/admin/login';
  }

  async function deleteProduct(id: string) {
    if (!window.confirm('Ẩn sản phẩm này khỏi catalog?')) return;
    await adminApi(`/admin/products/${id}`, { method: 'DELETE' });
    await load();
  }

  async function updateLead(id: string, status: string) {
    await adminApi(`/admin/contact-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  }

  if (loading) return <main className="admin-shell"><div className="admin-loading"><RefreshCw className="spin" size={18} /> Đang tải workspace...</div></main>;

  return <main className="admin-shell">
    <header className="admin-header"><div><Link className="wordmark" href="/">HomeHub</Link><span className="admin-divider">/</span><span className="admin-muted">Workspace cửa hàng</span></div><div className="admin-actions"><button className="quiet-button" onClick={() => void load()}><RefreshCw size={15} /> Làm mới</button><button className="quiet-button" onClick={() => void logout()}><LogOut size={15} /> Đăng xuất</button></div></header>
    {notice && <div className="admin-notice">{notice} <Link href="/admin/login">Đăng nhập lại</Link></div>}
    {context && <>
      <section className="admin-intro"><div><p className="eyebrow">OWNER WORKSPACE</p><h1>{context.name}</h1><p className="admin-muted">/{context.slug} · {context.status === 'ACTIVE' ? 'Đang hiển thị' : 'Đang tạm ngưng'}</p></div><Link className="primary-button" href={`/cua-hang/${context.slug}`} target="_blank">Xem storefront <ArrowUpRight size={16} /></Link></section>
      <section className="admin-grid">
        <div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">CATALOG</p><h2>Sản phẩm</h2></div><ProductForm categories={categories} brands={brands} attributeDefinitions={attributeDefinitions} onSaved={load} /></div>{products.length ? <div className="admin-table">{products.map((product) => <div className="admin-row product-admin-row" key={product.id}><div><strong>{product.name}</strong><small>{product.brand ? `${product.brand.name} · ` : ''}{product.publicationStatus} · {product.priceType}</small></div><div className="row-actions"><GalleryManager productId={product.id} images={product.images} onChanged={load} /><ProductForm categories={categories} brands={brands} attributeDefinitions={attributeDefinitions} product={product} onSaved={load} /><button className="icon-button" onClick={() => void deleteProduct(product.id)} aria-label={`Ẩn ${product.name}`}><Trash2 size={16} /></button></div></div>)}</div> : <p className="admin-muted">Chưa có sản phẩm. Tạo sản phẩm đầu tiên để storefront có nội dung.</p>}</div>
        <div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">TAXONOMY</p><h2>Danh mục</h2></div><CategoryForm onCreated={load} /></div>{categories.length ? <div className="admin-table">{categories.map((category) => <div className="admin-row" key={category.id}><div><strong>{category.name}</strong><small>/{category.slug}</small></div><span className="status-dot">{category.status}</span></div>)}</div> : <p className="admin-muted">Chưa có danh mục.</p>}</div>
        <div className="admin-panel"><BrandManager brands={brands} onChanged={load} /></div>
        <div className="admin-panel"><AttributeManager categories={categories} definitions={attributeDefinitions} onChanged={load} /></div>
        <div className="admin-panel admin-panel-wide"><ServiceManager services={services} onChanged={load} /></div>
        <div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">CONTACT REQUESTS</p><h2>Yêu cầu liên hệ</h2></div><span className="panel-count">{leads.length}</span></div>{leads.length ? <div className="admin-table">{leads.map((lead) => <div className="admin-row lead-row" key={lead.id}><div><strong>{lead.customerName}{lead.product ? ` · ${lead.product.name}` : ''}</strong><small>{lead.customerPhone} · {new Date(lead.createdAt).toLocaleDateString('vi-VN')}<br />{lead.message}</small></div><select value={lead.status} onChange={(event) => void updateLead(lead.id, event.target.value)}><option value="NEW">Mới</option><option value="CONTACTED">Đã liên hệ</option><option value="COMPLETED">Hoàn tất</option><option value="CANCELLED">Đã hủy</option></select></div>)}</div> : <p className="admin-muted">Chưa có yêu cầu liên hệ.</p>}</div>
        <div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">STORE PROFILE</p><h2>Thông tin cửa hàng</h2></div><Store size={18} /></div><StoreSettingsForm context={context} onSaved={load} /></div>
      </section>
    </>}
  </main>;
}

function CategoryForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    await adminApi('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) });
    setName('');
    setOpen(false);
    await onCreated();
  }

  if (!open) return <button className="small-button" onClick={() => setOpen(true)}><Plus size={15} /> Thêm</button>;
  return <form className="inline-form" onSubmit={submit}><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên danh mục" required /><button className="small-button" type="submit"><Check size={15} /></button></form>;
}
