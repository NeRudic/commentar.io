export const ALLOWED_TYPES = ['text/plain', 'image/jpeg', 'image/gif', 'image/png'] as const;
export const ALLOWED_EXTENSIONS = '.txt,.jpg,.jpeg,.gif,.png';
export const TXT_MAX_SIZE = 100 * 1024;

export type AllowedMime = (typeof ALLOWED_TYPES)[number];
