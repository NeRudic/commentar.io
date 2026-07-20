import { BASE_URL } from "./index";
import axios from "axios";

export default async function deleteComment(
  commentId: number,
  userEmail: string,
): Promise<boolean> {
  const { data } = await axios.delete<boolean>(
    `${BASE_URL}/comments/${commentId}`,
    { params: { user_email: userEmail } },
  );
  return data;
}
