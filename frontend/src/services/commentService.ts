import { get, post } from './apiClient';
import type { CommentWithUser, CreateCommentRequest, PaginatedComments } from '@shared/api/types';

export function createComment(dto: CreateCommentRequest): Promise<CommentWithUser> {
  return post<CommentWithUser>('/comments', dto);
}

export function getRootComments(page?: number): Promise<PaginatedComments> {
  const query = page ? `?page=${page}` : '';
  return get<PaginatedComments>(`/comments${query}`);
}

export function getCommentReplies(commentId: number): Promise<CommentWithUser[]> {
  return get<CommentWithUser[]>(`/comments/${commentId}/replies`);
}
