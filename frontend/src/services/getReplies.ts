import { BASE_URL } from "./index";
import axios from "axios";
import type { CommentRow } from "../types";

export default async function getReplies(
  parentCommentId: number,
  limit = 25,
  offset = 0,
): Promise<CommentRow[]> {
  const { data } = await axios.get<CommentRow[]>(
    `${BASE_URL}/comments/${parentCommentId}/replies`,
    { params: { limit, offset } },
  );
  return data;
}
