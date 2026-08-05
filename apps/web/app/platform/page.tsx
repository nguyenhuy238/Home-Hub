'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LogOut, Plus, RefreshCw, Store } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';

type PlatformStore = { id: string; name: string; slug: string; status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'; suspensionNotice: string | null; ownerContactEmail: string; createdAt: string; membership: { user: { email: string; displayName: string } } | null };

const statusLabels: Record<PlatformStore['status'], string> = { ACTIVE: 'Đang hoạt động', SUSPENDED: 'Đang tạm ngưng', ARCHIVED: 'Đã lưu trữ' };

export default function PlatformPage() {
  const [stores, setStores] = useState<PlatformStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    try { const data = await adminApi<PlatformStore[]>('/platform/stores'); setStores(Array.isArray(data) ? data : []); setNotice(''); }
    catch (error) { setNotice(error instanceof Error && error.message === 'forbidden' ? 'Tài khoản hiện tại không có quyền platform admin.' : error instanceof Error && error.message === 'unauthorized' ? 'Phiên đăng nhập đã hết hạn.' : 'Chưa tải được danh sách cửa hàng.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function logout() { await adminApi('/auth/logout', { method: 'POST' }); window.location.href = '/platform/login'; }

  if (loading) return <main className="admin-shell"><div className="admin-loading"><RefreshCw className="spin" size={18} /> Đang tải platform workspace...</div></main>;
  return <main className="admin-shell"><header className="admin-header"><div><Link className="wordmark" href="/">HomeHub</Link><span className="admin-divider">/</span><span className="admin-muted">Platform Admin</span></div><div className="admin-actions"><button className="quiet-button" onClick={() => void load()}><RefreshCw size={15} /> Làm mới</button><button className="quiet-button" onClick={() => void logout()}><LogOut size={15} /> Đăng xuất</button></div></header>{notice && <div className="admin-notice">{notice} <Link href="/platform/login">Đăng nhập lại</Link></div>}<section className="admin-intro"><div><p className="eyebrow">MULTI-STORE OPERATIONS</p><h1>Quản lý các cửa hàng.</h1><p className="admin-muted">Tạo storefront mới và kiểm soát trạng thái hiển thị của hệ thống.</p></div><span className="platform-count"><Store size={17} /> {stores.length} cửa hàng</span></section><section className="platform-grid"><div className="admin-panel"><CreateStoreForm onCreated={load} /></div><div className="admin-panel admin-panel-wide"><div className="panel-heading"><div><p className="eyebrow">STORES</p><h2>Danh sách cửa hàng</h2></div></div>{stores.length ? <div className="platform-store-list">{stores.map((store) => <StoreRow key={store.id} store={store} onChanged={load} />)}</div> : <p className="admin-muted">Chưa có cửa hàng nào.</p>}</div></section></main>;
}

function CreateStoreForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try { await adminApi('/platform/stores', { method: 'POST', body: JSON.stringify(Object.fromEntries(form.entries())) }); event.currentTarget.reset(); await onCreated(); setMessage('Đã tạo cửa hàng và tài khoản OWNER.'); }
    catch { setMessage('Không thể tạo cửa hàng. Kiểm tra slug, email và mật khẩu.'); }
    finally { setSaving(false); }
  }
  return <><div className="panel-heading"><div><p className="eyebrow">NEW STORE</p><h2>Tạo cửa hàng</h2></div><Plus size={18} /></div><form className="platform-form" onSubmit={submit}><label>Tên cửa hàng<input name="name" required minLength={2} placeholder="Nội thất An Nhiên" /></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="noi-that-an-nhien" /></label><label>Tên OWNER<input name="ownerDisplayName" required minLength={2} placeholder="Nguyễn Văn A" /></label><label>Email OWNER<input name="ownerEmail" type="email" required placeholder="owner@example.com" /></label><label>Mật khẩu OWNER<input name="ownerPassword" type="password" required minLength={8} placeholder="Tối thiểu 8 ký tự" /></label><label>Số điện thoại<input name="ownerPhone" placeholder="0901 234 567" /></label><button className="small-button" type="submit" disabled={saving}>{saving ? 'Đang tạo...' : <><Plus size={15} /> Tạo cửa hàng</>}</button>{message && <p className="form-message"><Check size={14} /> {message}</p>}</form></>;
}

function StoreRow({ store, onChanged }: { store: PlatformStore; onChanged: () => Promise<void> }) {
  const [status, setStatus] = useState(store.status);
  const [suspensionNotice, setSuspensionNotice] = useState(store.suspensionNotice ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function save() { setSaving(true); setMessage(''); try { await adminApi(`/platform/stores/${store.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, suspensionNotice: suspensionNotice || undefined }) }); await onChanged(); setMessage('Đã lưu trạng thái.'); } catch { setMessage('Không thể cập nhật trạng thái.'); } finally { setSaving(false); } }
  return <article className="platform-store-row"><div className="platform-store-main"><div><strong>{store.name}</strong><small>/{store.slug} · {store.membership?.user.displayName ?? 'Chưa có OWNER'} · {store.membership?.user.email ?? store.ownerContactEmail}</small></div><Link className="text-link" href={`/cua-hang/${store.slug}`} target="_blank">Mở storefront <ArrowUpRight size={14} /></Link></div><div className="platform-store-controls"><select value={status} onChange={(event) => setStatus(event.target.value as PlatformStore['status'])}><option value="ACTIVE">Đang hoạt động</option><option value="SUSPENDED">Đang tạm ngưng</option><option value="ARCHIVED">Đã lưu trữ</option></select>{status === 'SUSPENDED' && <input value={suspensionNotice} onChange={(event) => setSuspensionNotice(event.target.value)} placeholder="Thông báo tạm ngưng" maxLength={1000} />}<button className="small-button" onClick={() => void save()} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'} </button><span className="status-dot">{statusLabels[status]}</span>{message && <span className="form-message">{message}</span>}</div></article>;
}
