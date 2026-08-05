'use client';

import { FormEvent, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export function ContactForm({ storeSlug, productSlug }: { storeSlug: string; productSlug?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/public/stores/${encodeURIComponent(storeSlug)}/contact-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: data.get('customerName'), customerPhone: data.get('customerPhone'), customerEmail: data.get('customerEmail') || undefined, message: data.get('message'), productSlug }) });
      if (!response.ok) throw new Error('contact-failed');
      event.currentTarget.reset();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') return <div className="contact-success"><Check size={22} /><div><strong>Đã gửi thông tin liên hệ</strong><p>Cửa hàng sẽ liên hệ lại với bạn sớm nhất.</p></div></div>;
  return <form className="contact-form" onSubmit={submit}><label>Họ và tên<input name="customerName" required minLength={2} placeholder="Nguyễn Văn A" /></label><label>Số điện thoại<input name="customerPhone" required minLength={8} placeholder="0900 000 000" /></label><label>Email <span>(không bắt buộc)</span><input name="customerEmail" type="email" placeholder="ban@example.com" /></label><label>Nội dung cần tư vấn<textarea name="message" required minLength={5} rows={4} placeholder="Tôi muốn hỏi về sản phẩm..." /></label><button className="primary-button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><LoaderCircle className="spin" size={16} /> Đang gửi</> : <>Gửi yêu cầu <ArrowUpRight size={16} /></>}</button>{state === 'error' && <p className="form-error">Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi trực tiếp cho cửa hàng.</p>}</form>;
}
