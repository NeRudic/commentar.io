// ---- Responses ----

export interface UserRow {
  id: number;
  user_name: string;
  email: string;
  home_page: string | null;
}

export interface CommentWithUser {
  id: number;
  text: string;
  parent_comment_id: number | null;
  user_email: string;
  file_path: string | null;
  created_at: string;
  user_name: string;
  home_page: string | null;
  email: string;
}

export interface PaginatedComments {
  comments: CommentWithUser[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
}

// ---- Requests ----

export interface CreateUserRequest {
  user_name: string;
  email: string;
  home_page?: string;
}

export interface CreateCommentRequest {
  email: string;
  text: string;
  parent_comment_id?: number;
  file_path?: string;
}

export interface GetCommentsQuery {
  page?: number;
}
