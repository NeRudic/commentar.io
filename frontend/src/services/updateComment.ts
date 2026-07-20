import { BASE_URL } from "./index";
import axios from "axios";
import type { CommentRow, UpdateCommentRequest } from "../types";

export default async function updateComment(
  commentId: number,
  data: UpdateCommentRequest,
): Promise<CommentRow> {
  const { data: result } = await axios.patch<CommentRow>(
    `${BASE_URL}/comment-and-user/${commentId}`,
    data,
  );
  return result;
}
