import { BASE_URL } from "./index";
import axios from "axios";
import type { CreateCommentRequest, CommentRow } from "../types";

export default async function createComment(
  data: CreateCommentRequest,
): Promise<CommentRow> {
  const { data: result } = await axios.post<CommentRow>(
    BASE_URL + "/comments",
    data,
  );
  return result;
}
