import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['strong', 'i', 'code'];

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {},
      });
    }
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof (value as Record<string, unknown>)[key] === 'string') {
          (value as Record<string, unknown>)[key] = sanitizeHtml(
            (value as Record<string, unknown>)[key] as string,
            { allowedTags: ALLOWED_TAGS, allowedAttributes: {} },
          );
        }
      }
    }
    return value;
  }
}
