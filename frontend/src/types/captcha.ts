export interface Captcha {
  token: string;
  a: number;
  b: number;
}

export interface CaptchaVerifyResponse {
  valid: boolean;
  expired?: boolean;
  newCaptcha?: Captcha;
}
