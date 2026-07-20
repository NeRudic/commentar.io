import DOMPurify from 'dompurify';
import { ALLOWED_TAGS, ALLOWED_ATTRIBUTES } from '@shared/tags';

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTRIBUTES],
  });
}
