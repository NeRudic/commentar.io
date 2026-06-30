import { BASE_URL } from "./index";
import axios from "axios";
import type { CreateUserRequest, UserRow } from "../types";

export default async function createUser(
  data: CreateUserRequest,
): Promise<UserRow> {
  const { data: result } = await axios.post<UserRow>(BASE_URL + "/users", data);
  return result;
}
