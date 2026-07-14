export const UPLOADS_DIR = 'uploads';

export const TEMP_DIR = '.tmp';

export const FILE_UPLOAD_CONFIG = {
  TXT_MAX_SIZE: 100 * 1024,
  MAX_WIDTH: 320,
  MAX_HEIGHT: 240,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  RANDOM_RANGE: 1_000_000,
  RETRY_LIMIT: 3,
  CLEANUP_THRESHOLD_MS: 3_600_000,
  CLEANUP_INTERVAL_MS: 3_600_000,
  ALLOWED_TYPES: [
    'text/plain',
    'image/jpeg',
    'image/gif',
    'image/png',
  ] as const,
};

export const MIME_TO_EXT: Record<string, string> = {
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/png': '.png',
};
