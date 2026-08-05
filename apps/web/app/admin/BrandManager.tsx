'use client';

import { FormEvent, useState } from 'react';
import { Check, Plus, Send } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import type { Brand } from './types';

export function BrandManager({ brands, onChanged }: { brands: Brand[]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      await adminApi('/admin/brands', { method: 'POST', body: JSON.stringify({ name, slug: slug || undefined }) });
      setName(''); setSlug(''); setOpen(false); await onChanged(); setMessage('Đã thêm thương hiệu.');
    } catch {
      setMessage('Không thể thêm thương hiệu. Kiểm tra slug và thử lại.');
    }
  }

  async function updateStatus(id: string, status: string) {
    try { await adminApi(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await onChanged(); } catch { setMessage('Không thể cập nhật thương hiệu.'); }
  }

  return <><div className="panel-heading"><div><p className="eyebrow">BRANDS</p><h2>Thương hiệu</h2></div><button className="small-button" onClick={() => setOpen((value) => !value)}><Plus size={15} /> {open ? 'Đóng' : 'Thêm'}</button></div>{open && <form className="inline-form manager-form" onSubmit={submit}><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên thương hiệu" required /><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug tùy chọn" /><button className="small-button" type="submit"><Send size={15} /> Lưu</button></form>}{brands.length ? <div className="admin-table">{brands.map((brand) => <div className="admin-row" key={brand.id}><div><strong>{brand.name}</strong><small>/{brand.slug}</small></div><select value={brand.status} onChange={(event) => void updateStatus(brand.id, event.target.value)}><option value="ACTIVE">Đang dùng</option><option value="HIDDEN">Đã ẩn</option></select></div>)}</div> : <p className="admin-muted">Chưa có thương hiệu.</p>}{message && <p className="form-message"><Check size={14} /> {message}</p>}</>;
}
