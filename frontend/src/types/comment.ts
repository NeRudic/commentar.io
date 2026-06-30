export interface CommentRow {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  text: string;
  user_email: string;
  user_name: string;
  home_page: string | null;
  file_path: string | null;
  created_at: string;
}

export interface CreateCommentRequest {
  post_id: number;
  parent_comment_id?: number | null;
  text: string;
  user_email: string;
  file_path?: string | null;
}
