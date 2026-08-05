'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import type { Context } from './types';

export function StoreSettingsForm({ context, onSaved }: { context: Context; onSaved: () => Promise<void> }) {
  const settings = context.settings;
  const [slug, setSlug] = useState(context.slug);
  const [description, setDescription] = useState(settings?.description ?? '');
  const [address, setAddress] = useState(settings?.address ?? '');
  const [phone, setPhone] = useState(settings?.phone ?? '');
  const [email, setEmail] = useState(settings?.email ?? '');
  const [zaloUrl, setZaloUrl] = useState(settings?.zaloUrl ?? '');
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebookUrl ?? '');
  const [mapUrl, setMapUrl] = useState(settings?.mapUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSlug(context.slug);
    setDescription(context.settings?.description ?? '');
    setAddress(context.settings?.address ?? '');
    setPhone(context.settings?.phone ?? '');
    setEmail(context.settings?.email ?? '');
    setZaloUrl(context.settings?.zaloUrl ?? '');
    setFacebookUrl(context.settings?.facebookUrl ?? '');
    setMapUrl(context.settings?.mapUrl ?? '');
  }, [context]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await adminApi('/admin/store-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          description: description.trim() || null,
          address: address.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          zaloUrl: zaloUrl.trim() || null,
          facebookUrl: facebookUrl.trim() || null,
          mapUrl: mapUrl.trim() || null,
        }),
      });
      if (slug.trim() !== context.slug) {
        await adminApi('/admin/store-settings/slug', { method: 'PATCH', body: JSON.stringify({ slug: slug.trim() }) });
      }
      await onSaved();
      setMessage('Đã lưu thông tin cửa hàng.');
    } catch (error) {
      setMessage(error instanceof Error && error.message === 'unauthorized' ? 'Phiên đăng nhập đã hết hạn.' : 'Không thể lưu. Kiểm tra dữ liệu và thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return <form className="settings-form" onSubmit={submit}>
    <div className="settings-grid">
      <label>Đường dẫn cửa hàng<input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="ten-cua-hang" required /></label>
      <label>Số điện thoại<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901 234 567" /></label>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="hello@cuahang.vn" /></label>
      <label>Địa chỉ<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Địa chỉ showroom" /></label>
    </div>
    <label>Mô tả cửa hàng<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Giới thiệu ngắn về cửa hàng, sản phẩm và dịch vụ." rows={4} /></label>
    <div className="settings-grid">
      <label>Link Zalo<input type="url" value={zaloUrl} onChange={(event) => setZaloUrl(event.target.value)} placeholder="https://zalo.me/..." /></label>
      <label>Link Facebook<input type="url" value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://facebook.com/..." /></label>
      <label>Link bản đồ<input type="url" value={mapUrl} onChange={(event) => setMapUrl(event.target.value)} placeholder="https://maps.google.com/..." /></label>
    </div>
    <div className="form-actions"><button className="small-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : <><Save size={15} /> Lưu thông tin</>}</button>{message && <span className="form-message"><Check size={14} /> {message}</span>}</div>
  </form>;
}
