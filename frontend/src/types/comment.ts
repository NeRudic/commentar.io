export interface CommentRow {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  user_name: string;
  user_email: string;
  text: string;
  home_page: string | null;
  file_path: string | null;
  created_at: string;
}

export interface CreateCommentRequest {
  post_id: number;
  parent_comment_id: number | null;
  user_email: string;
  text: string;
  file_path: string | null;
  captcha_token: string;
  captcha_answer: string;
}
