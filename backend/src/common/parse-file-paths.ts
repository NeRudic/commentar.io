export function parseFilePaths(value: unknown): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value as string) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [value as string];
  } catch {
    return [value as string];
  }
}
