// ---- Responses ----

export interface UserRow {
  id: number;
  user_name: string;
  email: string;
  home_page: string | null;
}

export interface CommentRow {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  text: string;
  user_email: string;
  file_path: string | null;
  created_at: string;
}

// ---- Requests ----

export interface CreateUserRequest {
  user_name: string;
  email: string;
  home_page?: string;
}
