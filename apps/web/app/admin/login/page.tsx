'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowUpRight, LoaderCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
      if (!response.ok) throw new Error('login-failed');
      const body = await response.json() as { data?: { isPlatformAdmin?: boolean } };
      window.location.href = body.data?.isPlatformAdmin ? '/platform' : '/admin';
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
      setSending(false);
    }
  }

  return <main className="admin-shell"><div className="admin-login-card"><Link className="back-link" href="/"><ArrowLeft size={15} /> HomeHub</Link><p className="eyebrow">KHU VỰC QUẢN TRỊ</p><h1>Quản lý catalog của cửa hàng.</h1><p className="admin-muted">Đăng nhập bằng tài khoản OWNER để cập nhật sản phẩm, danh mục và xem yêu cầu liên hệ.</p><form className="contact-form" onSubmit={submit}><label>Email<input name="email" type="email" required placeholder="owner@example.com" /></label><label>Mật khẩu<input name="password" type="password" required placeholder="••••••••" /></label><button className="primary-button" type="submit" disabled={sending}>{sending ? <><LoaderCircle className="spin" size={16} /> Đang đăng nhập</> : <>Đăng nhập <ArrowUpRight size={16} /></>}</button>{error && <p className="form-error">{error}</p>}</form></div></main>;
}
