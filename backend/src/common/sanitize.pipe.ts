import { Injectable, PipeTransform } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['strong', 'i', 'code', 'a'];

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: { a: ['href', 'title'] },
      });
    }
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof (value as Record<string, unknown>)[key] === 'string') {
          (value as Record<string, unknown>)[key] = sanitizeHtml(
            (value as Record<string, unknown>)[key] as string,
            {
              allowedTags: ALLOWED_TAGS,
              allowedAttributes: { a: ['href', 'title'] },
            },
          );
        }
      }
    }
    return value;
  }
}
