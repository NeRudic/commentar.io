import { post } from './apiClient';
import type { CreateUserRequest, UserRow } from '@shared/api/types';

export function findOrCreateUser(dto: CreateUserRequest): Promise<UserRow> {
  return post<UserRow>('/users', dto);
}
