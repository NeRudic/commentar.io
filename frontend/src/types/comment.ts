export interface CommentRow {
  comment_id: number;
  post_id: number;
  parent_comment_id: number | null;
  user_name: string;
  user_email: string;
  text: string;
  home_page: string | null;
  file_paths: string[];
  created_at: string;
  reply_count: number;
}

export interface CreateCommentRequest {
  post_id: number;
  parent_comment_id: number | null;
  user_name: string;
  user_email: string;
  home_page: string | null;
  text: string;
  file_paths: string[];
  captcha_token: string;
  captcha_answer: string;
}

export interface CreateCommentResponse {
  comment: CommentRow;
  siblings: CommentRow[];
}

export interface UpdateCommentRequest {
  text: string;
  user_email: string;
  file_paths: string[];
  captcha_token: string;
  captcha_answer: string;
}
