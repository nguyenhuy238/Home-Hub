'use client';

import { useEffect, useRef } from 'react';

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  function format(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList') {
    document.execCommand(command);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  }

  return <div className="rich-editor"><div className="rich-toolbar"><button type="button" onClick={() => format('bold')}><strong>B</strong></button><button type="button" onClick={() => format('italic')}><em>I</em></button><button type="button" onClick={() => format('underline')}><u>U</u></button><button type="button" onClick={() => format('insertUnorderedList')}>Danh sách</button></div><div ref={editorRef} className="rich-editor-surface" contentEditable role="textbox" aria-label="Nội dung định dạng" onInput={(event) => onChange(event.currentTarget.innerHTML)} /> </div>;
}
