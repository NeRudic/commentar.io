import { SanitizePipe } from "./sanitize.pipe";

describe("SanitizePipe", () => {
  const pipe = new SanitizePipe();

  // ── Plain text ─────────────────────────────────────────────────

  it("passes plain text through unchanged", () => {
    expect(pipe.sanitize("Hello, world!")).toBe("Hello, world!");
  });

  it("returns empty string unchanged", () => {
    expect(pipe.sanitize("")).toBe("");
  });

  // ── XSS vectors — fully escaped ────────────────────────────────

  it("escapes <script> tags completely", () => {
    const input = '<script>alert("xss")</script>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("</script>");
    expect(result).toContain("&lt;script&gt;");
    expect(result).toContain("&lt;/script&gt;");
  });

  it("escapes event handlers on allowed tags", () => {
    const input = '<strong onclick="alert(1)">text</strong>';
    const result = pipe.sanitize(input);
    // onclick is not whitespace, so the simple-tag regex won't match
    // the whole thing stays escaped
    expect(result).toContain("&lt;strong onclick=");
    expect(result).not.toContain("<strong");
  });

  it("escapes <img> tags", () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = pipe.sanitize(input);
    expect(result).not.toContain("<img");
    expect(result).toContain("&lt;img");
  });

  // ── Allowed simple tags ────────────────────────────────────────

  it("preserves <strong> tags", () => {
    expect(pipe.sanitize("<strong>bold</strong>")).toBe(
      "<strong>bold</strong>",
    );
  });

  it("preserves <i> tags", () => {
    expect(pipe.sanitize("<i>italic</i>")).toBe("<i>italic</i>");
  });

  it("preserves <code> tags", () => {
    expect(pipe.sanitize("<code>code</code>")).toBe("<code>code</code>");
  });

  it("preserves nested allowed tags", () => {
    const input = "<strong><i>bold+italic</i></strong>";
    expect(pipe.sanitize(input)).toBe(input);
  });

  it("is case-insensitive for allowed tags", () => {
    expect(pipe.sanitize("<STRONG>BOLD</STRONG>")).toBe(
      "<STRONG>BOLD</STRONG>",
    );
  });

  // ── Allowed <a> tag ────────────────────────────────────────────

  it("preserves <a> with href", () => {
    const input = '<a href="https://example.com">link</a>';
    expect(pipe.sanitize(input)).toBe(input);
  });

  it("preserves <a> with href and title", () => {
    const input = '<a href="https://x.com" title="tooltip">link</a>';
    expect(pipe.sanitize(input)).toBe(input);
  });

  it("preserves href with query params containing &", () => {
    const input = '<a href="https://x.com?a=1&b=2">link</a>';
    expect(pipe.sanitize(input)).toBe(input);
  });

  it("blocks javascript: protocol in href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain("<a href=");
    expect(result).toContain("&lt;a href=");
  });

  it("blocks data: protocol in href", () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">x</a>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain("<a href=");
  });

  it("blocks vbscript: protocol in href", () => {
    const input = '<a href="vbscript:msgbox(1)">x</a>';
    const result = pipe.sanitize(input);
    expect(result).not.toContain("<a href=");
  });

  it("keeps <a> escaped when extra attributes present", () => {
    const input = '<a href="good.com" onclick="bad()">link</a>';
    const result = pipe.sanitize(input);
    // onclick blocks the regex match → stays fully escaped
    expect(result).not.toContain("<a href=");
    expect(result).toContain("&lt;a href=");
  });

  it("handles multiple <a> tags in one string", () => {
    const input =
      '<a href="https://a.com">A</a> <a href="https://b.com" title="b">B</a>';
    expect(pipe.sanitize(input)).toBe(input);
  });

  // ── Mixed content ──────────────────────────────────────────────

  it("escapes unknown tags but keeps allowed ones", () => {
    const input =
      "<strong>safe</strong><script>danger</script><i>also safe</i>";
    const result = pipe.sanitize(input);
    expect(result).toContain("<strong>safe</strong>");
    expect(result).toContain("<i>also safe</i>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("handles text with ampersands", () => {
    const input = "Tom & Jerry";
    const result = pipe.sanitize(input);
    expect(result).toBe("Tom &amp; Jerry");
  });

  // ── Pipe transform (body mode) ─────────────────────────────────

  it("sanitizes all string fields when no field filter is given", () => {
    const fullPipe = new SanitizePipe();
    const body = {
      text: "<script>x</script>",
      email: "a@b.com",
      num: 42,
    };
    const result = fullPipe.transform(body);
    expect(result.text).toContain("&lt;script&gt;");
    expect(result.email).toBe("a@b.com");
    expect(result.num).toBe(42);
  });

  it("sanitizes only specified fields", () => {
    const fieldPipe = new SanitizePipe(["text"]);
    const body = {
      text: "<script>x</script>",
      user_name: "<img>",
    };
    const result = fieldPipe.transform(body);
    expect(result.text).toContain("&lt;script&gt;");
    expect(result.user_name).toBe("<img>"); // untouched — not in field list
  });
});
