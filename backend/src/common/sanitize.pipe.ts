import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { validateAndEscapeXHTML } from './xhtml.validator';

const ALLOWED_TAGS = ['strong', 'i', 'code', 'a'];

const SANITIZE_OPTIONS = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { a: ['href', 'title'] },
};

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, SANITIZE_OPTIONS);
    }
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof (value as Record<string, unknown>)[key] !== 'string') continue;

        const str = (value as Record<string, unknown>)[key] as string;

        if (key === 'text') {
          const result = validateAndEscapeXHTML(str);
          if (!result.valid) {
            throw new BadRequestException(result.error);
          }
          (value as Record<string, unknown>)[key] = sanitizeHtml(
            result.escaped,
            SANITIZE_OPTIONS,
          );
        } else {
          (value as Record<string, unknown>)[key] = sanitizeHtml(
            str,
            SANITIZE_OPTIONS,
          );
        }
      }
    }
    return value;
  }
}
