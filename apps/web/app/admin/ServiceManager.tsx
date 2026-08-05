'use client';

import { FormEvent, useState } from 'react';
import { Check, Plus, Send } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import type { AdminService } from './types';

const statusLabels: Record<string, string> = { DRAFT: 'Bản nháp', PUBLISHED: 'Đang hiển thị', HIDDEN: 'Đã ẩn' };

export function ServiceManager({ services, onChanged }: { services: AdminService[]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [priceType, setPriceType] = useState('CONTACT');
  const [price, setPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await adminApi('/admin/services', { method: 'POST', body: JSON.stringify({
        name,
        shortDescription: shortDescription || undefined,
        priceType,
        price: price || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        publicationStatus: 'DRAFT',
      }) });
      setName(''); setShortDescription(''); setPrice(''); setMinPrice(''); setMaxPrice(''); setPriceType('CONTACT'); setOpen(false);
      await onChanged();
      setMessage('Đã tạo dịch vụ ở trạng thái bản nháp.');
    } catch {
      setMessage('Không thể tạo dịch vụ. Kiểm tra giá và thử lại.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, publicationStatus: string) {
    try {
      await adminApi(`/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify({ publicationStatus }) });
      await onChanged();
    } catch {
      setMessage('Không thể cập nhật trạng thái dịch vụ.');
    }
  }

  return <>
    <div className="panel-heading"><div><p className="eyebrow">SERVICES</p><h2>Dịch vụ</h2></div><button className="small-button" onClick={() => setOpen((value) => !value)}><Plus size={15} /> {open ? 'Đóng' : 'Thêm dịch vụ'}</button></div>
    {open && <form className="service-form" onSubmit={submit}><div className="settings-grid"><label>Tên dịch vụ<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tư vấn thiết kế" required /></label><label>Giá hiển thị<select value={priceType} onChange={(event) => setPriceType(event.target.value)}><option value="CONTACT">Liên hệ</option><option value="FIXED">Giá cố định</option><option value="FROM">Từ giá</option><option value="RANGE">Khoảng giá</option></select></label></div><label>Mô tả ngắn<textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} placeholder="Dịch vụ này giúp khách hàng điều gì?" rows={2} /></label>{priceType !== 'CONTACT' && <div className="settings-grid">{priceType !== 'RANGE' && <label>Giá VND<input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="numeric" placeholder="0" /></label>}{priceType === 'RANGE' && <><label>Giá từ<input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="0" /></label><label>Giá đến<input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="0" /></label></>}</div>}<button className="small-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : <><Send size={15} /> Lưu bản nháp</>}</button></form>}
    {services.length ? <div className="admin-table service-admin-list">{services.map((service) => <div className="admin-row" key={service.id}><div><strong>{service.name}</strong><small>{service.priceType} · {statusLabels[service.publicationStatus] ?? service.publicationStatus}</small></div><select value={service.publicationStatus} onChange={(event) => void updateStatus(service.id, event.target.value)}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></select></div>)}</div> : <p className="admin-muted">Chưa có dịch vụ. Thêm dịch vụ để giới thiệu năng lực của cửa hàng.</p>}
    {message && <p className="form-message"><Check size={14} /> {message}</p>}
  </>;
}
