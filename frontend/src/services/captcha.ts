import { BASE_URL } from "./index";
import axios from "axios";
import type { Captcha, CaptchaVerifyResponse } from "../types";

export async function getCaptcha(): Promise<Captcha> {
  const { data } = await axios.get<Captcha>(BASE_URL + "/captcha");
  return data;
}

export async function verifyCaptcha(
  token: string,
  clientAnswer: string,
): Promise<CaptchaVerifyResponse> {
  const { data } = await axios.post<CaptchaVerifyResponse>(
    BASE_URL + "/captcha/verify",
    { token, clientAnswer },
  );
  return data;
}
