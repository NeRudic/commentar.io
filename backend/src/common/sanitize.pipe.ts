import { Injectable, PipeTransform } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['strong', 'i', 'code'];

/**
 * NestJS Pipe that sanitizes string input to prevent XSS attacks.
 * Only <strong>, <i>, and <code> tags are allowed; all other HTML
 * is stripped (not just escaped).
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  constructor(
    private readonly options: sanitizeHtml.IOptions = {},
  ) {}

  transform(value: any): any {
    if (typeof value === 'string') {
      return this.sanitize(value);
    }

    if (typeof value === 'object' && value !== null) {
      const result = { ...value };
      for (const key of Object.keys(result)) {
        if (typeof result[key] === 'string') {
          result[key] = this.sanitize(result[key]);
        }
      }
      return result;
    }

    return value;
  }

  sanitize(input: string): string {
    if (!input || typeof input !== 'string') return input;

    return sanitizeHtml(input, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {},
      ...this.options,
    });
  }
}
