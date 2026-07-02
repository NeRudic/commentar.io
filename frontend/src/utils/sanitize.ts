import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'];
const ALLOWED_ATTR = ['href', 'title'];

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
