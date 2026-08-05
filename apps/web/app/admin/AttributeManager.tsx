'use client';

import { FormEvent, useState } from 'react';
import { Check, Plus, Send } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import type { AttributeDefinition, Category } from './types';

const typeLabels: Record<string, string> = { TEXT: 'Văn bản', NUMBER: 'Số', BOOLEAN: 'Có/không', SELECT: 'Lựa chọn' };

export function AttributeManager({ categories, definitions, onChanged }: { categories: Category[]; definitions: AttributeDefinition[]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [dataType, setDataType] = useState('TEXT');
  const [categoryId, setCategoryId] = useState('');
  const [options, setOptions] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      await adminApi('/admin/attributes', { method: 'POST', body: JSON.stringify({ name, code, dataType, categoryId: categoryId || undefined, optionsJson: dataType === 'SELECT' ? { values: options.split(',').map((value) => value.trim()).filter(Boolean) } : undefined }) });
      setName(''); setCode(''); setCategoryId(''); setOptions(''); setDataType('TEXT'); setOpen(false); await onChanged(); setMessage('Đã thêm thuộc tính.');
    } catch {
      setMessage('Không thể thêm thuộc tính. Kiểm tra mã và options.');
    }
  }

  return <><div className="panel-heading"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h2>Thuộc tính</h2></div><button className="small-button" onClick={() => setOpen((value) => !value)}><Plus size={15} /> {open ? 'Đóng' : 'Thêm'}</button></div>{open && <form className="attribute-form" onSubmit={submit}><div className="settings-grid"><label>Tên thuộc tính<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Kích thước" required /></label><label>Mã<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="kich_thuoc" pattern="[a-z0-9_]+" required /></label></div><div className="settings-grid"><label>Kiểu dữ liệu<select value={dataType} onChange={(event) => setDataType(event.target.value)}><option value="TEXT">Văn bản</option><option value="NUMBER">Số</option><option value="BOOLEAN">Có/không</option><option value="SELECT">Lựa chọn</option></select></label><label>Áp dụng cho danh mục<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Tất cả danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>{dataType === 'SELECT' && <label>Tùy chọn, cách nhau bằng dấu phẩy<input value={options} onChange={(event) => setOptions(event.target.value)} placeholder="300x300, 600x600, 800x800" required /></label>}<button className="small-button" type="submit"><Send size={15} /> Lưu thuộc tính</button></form>}{definitions.length ? <div className="admin-table">{definitions.map((definition) => <div className="admin-row" key={definition.id}><div><strong>{definition.name}</strong><small>{definition.code} · {typeLabels[definition.dataType] ?? definition.dataType}{definition.category ? ` · ${definition.category.name}` : ''}</small></div><span className="status-dot">{definition.isFilterable ? 'Có bộ lọc' : 'Thông tin'}</span></div>)}</div> : <p className="admin-muted">Chưa có thuộc tính. Tạo thuộc tính để nhập thông số theo ngành hàng.</p>}{message && <p className="form-message"><Check size={14} /> {message}</p>}</>;
}
