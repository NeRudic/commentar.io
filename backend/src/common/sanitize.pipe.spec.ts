import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  const pipe = new SanitizePipe();

  // ── Plain text ─────────────────────────────────────────────────

  it('passes plain text through unchanged', () => {
    expect(pipe.sanitize('Hello, world!')).toBe('Hello, world!');
  });

  it('returns empty string unchanged', () => {
    expect(pipe.sanitize('')).toBe('');
  });

  // ── XSS vectors — stripped ─────────────────────────────────────

  it('strips <script> tags completely', () => {
    const input = '<script>alert("xss")</script>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('strips event handlers on allowed tags', () => {
    const input = '<strong onclick="alert(1)">text</strong>';
    const result = pipe.sanitize(input);
    expect(result).toBe('<strong>text</strong>');
  });

  it('strips <img> tags', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = pipe.sanitize(input);
    expect(result).not.toContain('<img');
  });

  // ── Allowed simple tags ────────────────────────────────────────

  it('preserves <strong> tags', () => {
    expect(pipe.sanitize('<strong>bold</strong>')).toBe(
      '<strong>bold</strong>',
    );
  });

  it('preserves <i> tags', () => {
    expect(pipe.sanitize('<i>italic</i>')).toBe('<i>italic</i>');
  });

  it('preserves <code> tags', () => {
    expect(pipe.sanitize('<code>code</code>')).toBe('<code>code</code>');
  });

  it('preserves nested allowed tags', () => {
    const input = '<strong><i>bold+italic</i></strong>';
    expect(pipe.sanitize(input)).toBe(input);
  });

  it('is case-insensitive for allowed tags', () => {
    expect(pipe.sanitize('<STRONG>BOLD</STRONG>')).toBe(
      '<strong>BOLD</strong>',
    );
  });

  // ── Disallowed tags ────────────────────────────────────────────

  it('strips <a> tags even with safe href', () => {
    const input = '<a href="https://example.com">link</a>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain('<a');
    expect(result).not.toContain('href');
    expect(result).toBe('link');
  });

  it('strips other HTML tags', () => {
    expect(pipe.sanitize('<div>text</div>')).toBe('text');
    expect(pipe.sanitize('<p>text</p>')).toBe('text');
    expect(pipe.sanitize('<em>text</em>')).toBe('text');
  });

  // ── Mixed content ──────────────────────────────────────────────

  it('strips unknown tags but keeps allowed ones', () => {
    const input =
      '<strong>safe</strong><script>danger</script><i>also safe</i>';
    const result = pipe.sanitize(input);
    expect(result).toContain('<strong>safe</strong>');
    expect(result).toContain('<i>also safe</i>');
    expect(result).not.toContain('<script>');
  });

  it('handles text with ampersands', () => {
    const input = 'Tom & Jerry';
    const result = pipe.sanitize(input);
    expect(result).toBe('Tom &amp; Jerry');
  });

  // ── Pipe transform (body mode) ─────────────────────────────────

  it('sanitizes all string fields in a body object', () => {
    const body = {
      text: '<script>x</script>',
      email: 'a@b.com',
      num: 42,
    };
    const result = pipe.transform(body);
    expect(result.text).not.toContain('<script>');
    expect(result.email).toBe('a@b.com');
    expect(result.num).toBe(42);
  });
});
