import { BASE_URL } from "./index";
import axios from "axios";
import type { Captcha } from "../types";

export async function getCaptcha(): Promise<Captcha> {
  const { data } = await axios.get<Captcha>(BASE_URL + "/captcha");
  return data;
}
