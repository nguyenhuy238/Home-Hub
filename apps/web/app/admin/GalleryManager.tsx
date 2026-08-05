'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Save, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import type { ProductImage } from './types';

export function GalleryManager({ productId, images: initialImages, onChanged }: { productId: string; images: ProductImage[]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setImages(initialImages); }, [initialImages]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage('');
    try {
      for (const [index, file] of Array.from(files).entries()) {
        const form = new FormData();
        form.append('file', file); form.append('altText', ''); form.append('isPrimary', images.length === 0 && index === 0 ? 'true' : 'false');
        const created = await adminApi<ProductImage>(`/admin/products/${productId}/images`, { method: 'POST', body: form });
        setImages((current) => [...current, created]);
      }
      await onChanged();
    } catch {
      setMessage('Không thể tải ảnh. Kiểm tra định dạng, dung lượng và Vercel Blob.');
    } finally { setBusy(false); }
  }

  async function remove(imageId: string) {
    if (!window.confirm('Xóa ảnh này khỏi gallery?')) return;
    setBusy(true); setMessage('');
    try { await adminApi(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' }); setImages((current) => current.filter((image) => image.id !== imageId)); await onChanged(); } catch { setMessage('Không thể xóa ảnh.'); } finally { setBusy(false); }
  }

  async function update(imageId: string, input: { isPrimary?: boolean; altText?: string }) {
    try { const updated = await adminApi<ProductImage>(`/admin/products/${productId}/images/${imageId}`, { method: 'PATCH', body: JSON.stringify(input) }); setImages((current) => current.map((image) => input.isPrimary ? { ...image, ...updated, isPrimary: image.id === imageId } : image.id === imageId ? updated : image)); await onChanged(); } catch { setMessage('Không thể cập nhật ảnh.'); }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const current = next[index];
    const replacement = next[target];
    if (!current || !replacement) return;
    next[index] = replacement;
    next[target] = current;
    setImages(next);
    try { await adminApi(`/admin/products/${productId}/images/reorder`, { method: 'PUT', body: JSON.stringify({ imageIds: next.map((image) => image.id) }) }); await onChanged(); } catch { setImages(images); setMessage('Không thể sắp xếp gallery.'); }
  }

  return <div className="gallery-manager"><button className="small-button" onClick={() => setOpen((value) => !value)}><ImagePlus size={15} /> {open ? 'Đóng gallery' : `Gallery (${initialImages.length})`}</button>{open && <div className="gallery-editor"><label className="file-button"><ImagePlus size={15} /> {busy ? 'Đang xử lý...' : 'Thêm nhiều ảnh'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={(event) => { void upload(event.target.files); event.currentTarget.value = ''; }} /></label>{images.length ? <div className="gallery-grid">{images.map((image, index) => <div className="gallery-card" key={image.id}>{image.publicUrl ? <img src={image.publicUrl} alt={image.altText || 'Ảnh sản phẩm'} /> : <div className="gallery-placeholder">Ảnh</div>}<div className="gallery-card-body"><input defaultValue={image.altText} aria-label="Alt text" onBlur={(event) => { if (event.target.value !== image.altText) void update(image.id, { altText: event.target.value }); }} /><div className="gallery-actions"><button type="button" className={image.isPrimary ? 'gallery-primary active' : 'gallery-primary'} onClick={() => void update(image.id, { isPrimary: true })} title="Đặt làm ảnh đại diện"><Star size={14} fill={image.isPrimary ? 'currentColor' : 'none'} /></button><button type="button" className="icon-button" onClick={() => void move(index, -1)} disabled={index === 0} aria-label="Đưa lên"><ChevronUp size={15} /></button><button type="button" className="icon-button" onClick={() => void move(index, 1)} disabled={index === images.length - 1} aria-label="Đưa xuống"><ChevronDown size={15} /></button><button type="button" className="icon-button danger-button" onClick={() => void remove(image.id)} aria-label="Xóa ảnh"><Trash2 size={15} /></button></div></div></div>)}</div> : <p className="admin-muted">Chưa có ảnh. Thêm ảnh để gallery storefront rõ ràng hơn.</p>}{message && <p className="form-message"><Save size={14} /> {message}</p>}</div>}</div>;
}
