export interface runResponse {
  lastID: number;
  changes: number;
}

export interface FileRow {
  id: number;
  path: string;
  status: 'pending' | 'published';
  created_at: string;
}
