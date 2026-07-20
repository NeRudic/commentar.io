import { ALLOWED_TAGS } from '../../../shared/tags';

export interface XHTMLValidationResult {
  valid: boolean;
  escaped: string;
  error?: string;
}

export function validateAndEscapeXHTML(input: string): XHTMLValidationResult {
  const allowed = new Set<string>(ALLOWED_TAGS);
  const stack: string[] = [];
  const out: string[] = [];
  let i = 0;

  while (i < input.length) {
    if (input[i] === '<') {
      const result = tryExtractAllowedTag(input, i, allowed);
      if (result) {
        const { tag, isClosing, tagName, end } = result;

        if (isClosing) {
          if (stack.length === 0) {
            out.push(escapeHtmlEntities(tag));
            i = end;
            continue;
          }
          const top = stack[stack.length - 1];
          if (top !== tagName) {
            return {
              valid: false,
              escaped: '',
              error: `Ожидался закрывающий </${top}>, но найден </${tagName}>`,
            };
          }
          stack.pop();
          out.push(tag);
        } else {
          stack.push(tagName);
          out.push(tag);
        }

        i = end;
        continue;
      }
    }

    if (input[i] === '<') {
      out.push('&lt;');
    } else {
      out.push(input[i]);
    }
    i++;
  }

  if (stack.length > 0) {
    const unclosed = stack.map((t) => `<${t}>`).join(', ');
    return {
      valid: false,
      escaped: '',
      error: `Незакрытые теги: ${unclosed}`,
    };
  }

  return { valid: true, escaped: out.join('') };
}

interface TagResult {
  tag: string;
  isClosing: boolean;
  tagName: string;
  end: number;
}

function tryExtractAllowedTag(
  input: string,
  start: number,
  allowed: Set<string>,
): TagResult | null {
  if (input[start] !== '<') return null;

  let pos = start + 1;
  const isClosing = input[pos] === '/';
  if (isClosing) pos++;

  const tagNameStart = pos;
  while (pos < input.length && /[a-zA-Z]/.test(input[pos])) pos++;
  const tagName = input.slice(tagNameStart, pos).toLowerCase();

  if (tagName.length === 0 || !allowed.has(tagName)) return null;

  if (isClosing) {
    while (pos < input.length && input[pos] !== '>') {
      if (input[pos] === '<') return null;
      pos++;
    }
    if (pos >= input.length) return null;
    pos++;
    return { tag: input.slice(start, pos), isClosing: true, tagName, end: pos };
  }

  while (pos < input.length) {
    if (input[pos] === '>') {
      if (pos > 0 && input[pos - 1] === '/') return null;
      pos++;
      return {
        tag: input.slice(start, pos),
        isClosing: false,
        tagName,
        end: pos,
      };
    }
    if (input[pos] === '"') {
      pos++;
      while (pos < input.length && input[pos] !== '"') pos++;
      if (pos >= input.length) return null;
      pos++;
      continue;
    }
    if (input[pos] === "'") {
      pos++;
      while (pos < input.length && input[pos] !== "'") pos++;
      if (pos >= input.length) return null;
      pos++;
      continue;
    }
    if (input[pos] === '<') return null;
    pos++;
  }

  return null;
}

function escapeHtmlEntities(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
