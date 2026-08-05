'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Plus, Save, Send } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import { RichTextEditor } from './RichTextEditor';
import type { AttributeDefinition, Brand, Category, Product } from './types';

type ProductFormProps = {
  categories: Category[];
  brands: Brand[];
  attributeDefinitions: AttributeDefinition[];
  product?: Product;
  onSaved: () => Promise<void>;
};

export function ProductForm({ categories, brands, attributeDefinitions, product, onSaved }: ProductFormProps) {
  const editing = Boolean(product);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product?.name ?? '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');
  const [descriptionHtml, setDescriptionHtml] = useState(product?.descriptionHtml ?? '');
  const [priceType, setPriceType] = useState(product?.priceType ?? 'CONTACT');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [minPrice, setMinPrice] = useState(product?.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(product?.maxPrice?.toString() ?? '');
  const [publicationStatus, setPublicationStatus] = useState(product?.publicationStatus ?? 'DRAFT');
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categories?.map(({ category }) => category.id) ?? []);
  const [brandId, setBrandId] = useState(product?.brand?.id ?? '');
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>(() => getAttributeValues(product));
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setShortDescription(product.shortDescription ?? '');
    setDescriptionHtml(product.descriptionHtml ?? '');
    setPriceType(product.priceType);
    setPrice(product.price?.toString() ?? '');
    setMinPrice(product.minPrice?.toString() ?? '');
    setMaxPrice(product.maxPrice?.toString() ?? '');
    setPublicationStatus(product.publicationStatus);
    setCategoryIds(product.categories?.map(({ category }) => category.id) ?? []);
    setBrandId(product.brand?.id ?? '');
    setAttributeValues(getAttributeValues(product));
  }, [product]);

  function reset() {
    if (editing) return;
    setName(''); setShortDescription(''); setDescriptionHtml(''); setPriceType('CONTACT'); setPrice(''); setMinPrice(''); setMaxPrice(''); setPublicationStatus('DRAFT'); setCategoryIds([]); setBrandId(''); setAttributeValues({}); setImage(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { name, shortDescription: shortDescription || undefined, descriptionHtml, priceType, price: price || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, categoryIds, brandId: brandId || undefined, publicationStatus };
      const saved = editing
        ? await adminApi<Product>(`/admin/products/${product?.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await adminApi<Product>('/admin/products', { method: 'POST', body: JSON.stringify(payload) });

      if (attributeDefinitions.length > 0) {
        const values: Array<{ attributeDefinitionId: string; valueText?: string; valueNumber?: string; valueBoolean?: boolean }> = [];
        for (const definition of attributeDefinitions) {
          const raw = attributeValues[definition.id]?.trim() ?? '';
          if (!raw) continue;
          if (definition.dataType === 'NUMBER') values.push({ attributeDefinitionId: definition.id, valueNumber: raw });
          else if (definition.dataType === 'BOOLEAN') values.push({ attributeDefinitionId: definition.id, valueBoolean: raw === 'true' });
          else values.push({ attributeDefinitionId: definition.id, valueText: raw });
        }
        await adminApi(`/admin/products/${saved.id}/attributes`, { method: 'PUT', body: JSON.stringify({ values }) });
      }

      if (image) {
        const form = new FormData();
        form.append('file', image); form.append('altText', name); form.append('isPrimary', 'true');
        await adminApi(`/admin/products/${saved.id}/images`, { method: 'POST', body: form });
      }

      setOpen(false);
      reset();
      await onSaved();
      setMessage(editing ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm nháp.');
    } catch (error) {
      setMessage(error instanceof Error && error.message === 'unauthorized' ? 'Phiên đăng nhập đã hết hạn.' : 'Không thể lưu sản phẩm. Kiểm tra giá, danh mục, thương hiệu và thuộc tính.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return <button className="small-button" onClick={() => { setMessage(''); setOpen(true); }}>{editing ? <><Save size={15} /> Sửa</> : <><Plus size={15} /> Thêm sản phẩm</>}</button>;

  return <form className="product-editor" onSubmit={submit}>
    <div className="settings-grid">
      <label>Tên sản phẩm<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên sản phẩm" required /></label>
      <label>Trạng thái<select value={publicationStatus} onChange={(event) => setPublicationStatus(event.target.value)}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></select></label>
    </div>
    <div className="settings-grid">
      <label>Thương hiệu<select value={brandId} onChange={(event) => setBrandId(event.target.value)}><option value="">Không chọn</option>{brands.filter((brand) => brand.status === 'ACTIVE' || brand.id === product?.brand?.id).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
      <label>Mô tả ngắn<textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} rows={2} placeholder="Mô tả để hiển thị trên danh sách sản phẩm." /></label>
    </div>
    <label>Mô tả chi tiết<RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} /></label>
    <div className="settings-grid">
      <label>Kiểu giá<select value={priceType} onChange={(event) => setPriceType(event.target.value)}><option value="CONTACT">Liên hệ</option><option value="FIXED">Giá cố định</option><option value="FROM">Từ giá</option><option value="RANGE">Khoảng giá</option></select></label>
      {priceType !== 'CONTACT' && priceType !== 'RANGE' && <label>Giá VND<input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" inputMode="numeric" /></label>}
      {priceType === 'RANGE' && <><label>Giá từ<input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" inputMode="numeric" /></label><label>Giá đến<input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="0" inputMode="numeric" /></label></>}
    </div>
    <label>Danh mục<select multiple value={categoryIds} onChange={(event) => setCategoryIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    {attributeDefinitions.length > 0 && <div className="attribute-editor"><p className="eyebrow">THÔNG SỐ</p>{attributeDefinitions.map((definition) => <AttributeField key={definition.id} definition={definition} value={attributeValues[definition.id] ?? ''} onChange={(value) => setAttributeValues((current) => ({ ...current, [definition.id]: value }))} />)}</div>}
    <label className="file-button">{editing ? 'Thay ảnh đại diện' : 'Ảnh đại diện'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} /></label>
    <div className="form-actions"><button className="small-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : <><Send size={15} /> {editing ? 'Lưu thay đổi' : 'Lưu nháp'}</>}</button><button className="quiet-button" type="button" onClick={() => { setOpen(false); reset(); }}>Hủy</button>{message && <span className="form-message"><Check size={14} /> {message}</span>}</div>
  </form>;
}

function getAttributeValues(product?: Product): Record<string, string> {
  return Object.fromEntries((product?.attributeValues ?? []).map((value) => [value.attributeDefinitionId, value.valueText ?? value.valueNumber?.toString() ?? (value.valueBoolean === null ? '' : String(value.valueBoolean))]));
}

function AttributeField({ definition, value, onChange }: { definition: AttributeDefinition; value: string; onChange: (value: string) => void }) {
  if (definition.dataType === 'SELECT') return <label>{definition.name}<select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Chưa chọn</option>{definition.optionsJson?.values?.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  if (definition.dataType === 'BOOLEAN') return <label>{definition.name}<select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Chưa chọn</option><option value="true">Có</option><option value="false">Không</option></select></label>;
  return <label>{definition.name}<input type={definition.dataType === 'NUMBER' ? 'number' : 'text'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={definition.dataType === 'NUMBER' ? '0' : `Nhập ${definition.name.toLowerCase()}`} /></label>;
}
