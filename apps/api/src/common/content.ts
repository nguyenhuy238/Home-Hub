import sanitizeHtml from 'sanitize-html';

export function sanitizeRichText(input: string | undefined | null): string {
  return sanitizeHtml(input ?? '', {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName: string, attribs: Record<string, string>) => ({ tagName: 'a', attribs: { ...attribs, rel: 'nofollow noopener noreferrer', target: '_blank' } }),
    },
  });
}
