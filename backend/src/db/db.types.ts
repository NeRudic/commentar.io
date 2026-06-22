export interface runResponse {
  lastID: number;
  changes: number;
}

export interface CommentRow {
  id: number;
  text: string;
  parent_comment_id: number | null;
  user_email: string;
  file_path: string | null;
  created_at: string;
}
