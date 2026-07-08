export interface UserRow {
  id: number;
  user_name: string;
  email: string;
  home_page: string | null;
}

export interface CreateUserRequest {
  user_name: string;
  user_email: string;
  home_page?: string;
}
