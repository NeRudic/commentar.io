import { BASE_URL } from "./index";
import axios from "axios";
import type { Captcha, CaptchaVerifyResponse } from "../types";

export async function getCaptcha(): Promise<Captcha> {
  const { data } = await axios.get<Captcha>(BASE_URL + "/captcha");
  return data;
}

export async function verifyCaptcha(
  captcha_token: string,
  captcha_answer: string,
): Promise<CaptchaVerifyResponse> {
  const { data } = await axios.post<CaptchaVerifyResponse>(
    BASE_URL + "/captcha/verify",
    { captcha_token, captcha_answer },
  );
  return data;
}
