import { BASE_URL } from "./index";
import axios from "axios";
import type { CommentRow } from "../types";

export default async function getComments(
  postId: number,
): Promise<CommentRow[]> {
  const { data } = await axios.get<CommentRow[]>(
    BASE_URL + "/comments/" + postId,
  );
  return data;
}
