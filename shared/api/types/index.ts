// ---- Responses ----

export interface UserRow {
  id: number;
  user_name: string;
  email: string;
  home_page: string | null;
}

// ---- Requests ----

export interface CreateUserRequest {
  user_name: string;
  email: string;
  home_page?: string;
}
