export interface runResponse {
  lastID: number;
  changes: number;
}

export interface UserRow {
  id: number;
  user_name: string;
  email: string;
  home_page: string | null;
}

export interface CommentRow {
  id: number;
  text: string;
  parent_comment_id: number | null;
  user_email: string;
  file_path: string | null;
  created_at: string;
}

export interface CommentWithUser extends CommentRow {
  user_name: string;
  home_page: string | null;
}
