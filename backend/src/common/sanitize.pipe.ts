import { Injectable, PipeTransform } from "@nestjs/common";

/** Tags whose opening and closing forms are safe to unescape unconditionally. */
const SIMPLE_TAGS = ["strong", "i", "code"];

/**
 * Regex matching the escaped form of `<a href="..." title="...">`.
 * Uses `((?:(?!&quot;).)*)` instead of `(.*?)` so the href/title capture
 * stops at the `&quot;` delimiter — otherwise extra attributes like
 * `onclick` would leak into the captured value.
 */
const A_OPEN_RE =
  /&lt;a\s+href=&quot;((?:(?!&quot;).)*)&quot;(?:\s+title=&quot;((?:(?!&quot;).)*)&quot;)?\s*&gt;/gi;

const DANGEROUS_PROTOCOL = /^(javascript|data|vbscript):/i;

@Injectable()
export class SanitizePipe implements PipeTransform {
  /**
   * @param fields - if provided, only these body keys are sanitized.
   *                 If omitted, every string value in the body is sanitized.
   */
  constructor(private readonly fields?: string[]) {}

  transform(value: any): any {
    if (typeof value === "string") {
      return this.sanitize(value);
    }

    if (typeof value === "object" && value !== null) {
      const result = { ...value };
      for (const key of Object.keys(result)) {
        if (typeof result[key] === "string") {
          if (!this.fields || this.fields.includes(key)) {
            result[key] = this.sanitize(result[key]);
          }
        }
      }
      return result;
    }

    return value;
  }

  // ── public for testing ──────────────────────────────────────────

  sanitize(input: string): string {
    if (!input || typeof input !== "string") return input;

    let result = this.#escapeHtml(input);
    result = this.#unescapeSimpleTags(result);
    result = this.#unescapeAnchorTags(result);
    return result;
  }

  // ── private helpers ─────────────────────────────────────────────

  #escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  #unescapeSimpleTags(str: string): string {
    for (const tag of SIMPLE_TAGS) {
      str = str.replace(
        new RegExp(`&lt;/(${tag})&gt;`, "gi"),
        (_m, t) => `</${t}>`,
      );
      str = str.replace(
        new RegExp(`&lt;(${tag})&gt;`, "gi"),
        (_m, t) => `<${t}>`,
      );
    }
    return str;
  }

  #unescapeAnchorTags(str: string): string {
    str = str.replace(A_OPEN_RE, (match, href: string, title?: string) => {
      const decodedHref = href.replace(/&amp;/g, "&");

      if (DANGEROUS_PROTOCOL.test(decodedHref)) {
        return match; // keep fully escaped
      }

      if (title !== undefined) {
        const decodedTitle = title.replace(/&amp;/g, "&");
        return `<a href="${decodedHref}" title="${decodedTitle}">`;
      }
      return `<a href="${decodedHref}">`;
    });

    str = str.replace(/&lt;\/a&gt;/gi, "</a>");
    return str;
  }
}
