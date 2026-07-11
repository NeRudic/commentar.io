import { BASE_URL } from "./index";
import axios from "axios";
import type { CommentRow } from "../types";

export default async function getRootComments(
  postId: number,
  limit = 25,
  offset = 0,
  sortBy?: string,
  sortOrder?: string,
): Promise<CommentRow[]> {
  const { data } = await axios.get<CommentRow[]>(
    `${BASE_URL}/comments/${postId}`,
    { params: { limit, offset, sort_by: sortBy, sort_order: sortOrder } },
  );
  return data;
}
