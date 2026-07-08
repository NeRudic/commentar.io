export interface Captcha {
  token: string;
  a: number;
  b: number;
}

export interface CaptchaErrorResponse {
  expired: boolean;
  new_captcha: Captcha;
  error_message: string;
}
