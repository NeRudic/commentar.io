import { BASE_URL } from "./index";
import axios from "axios";
import type { CreateCommentRequest, CreateCommentResponse } from "../types";

export default async function createComment(
  data: CreateCommentRequest,
): Promise<CreateCommentResponse> {
  const { data: result } = await axios.post<CreateCommentResponse>(
    BASE_URL + "/comment-and-user",
    data,
  );
  return result;
}
