import { useState, useEffect } from 'react';
import { getCaptcha } from '../../../services';
import type { Captcha } from '../../../types';

function isCaptchaErrorResponse(
  value: unknown,
): value is { error_message: string; new_captcha: Captcha } {
  if (typeof value !== 'object' || value === null) return false;
  const ce = value as Record<string, unknown>;
  if (typeof ce.error_message !== 'string') return false;
  if (typeof ce.new_captcha !== 'object' || ce.new_captcha === null)
    return false;
  const nc = ce.new_captcha as Record<string, unknown>;
  return typeof nc.svg === 'string' && typeof nc.token === 'string';
}

export default function useCaptcha() {
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    getCaptcha()
      .then(setCaptcha)
      .catch(() => setCaptchaError('Не удалось загрузить капчу'));
  }, []);

  const refreshCaptcha = (newCaptcha: Captcha) => {
    setCaptcha(newCaptcha);
    setCaptchaAnswer('');
  };

  const handleSubmitError = (err: unknown) => {
    const e = err as Record<string, unknown>;
    const data = (e.response as Record<string, unknown> | undefined)
      ?.data as Record<string, unknown> | undefined;
    const captchaErr = data?.captcha_error;

    if (isCaptchaErrorResponse(captchaErr)) {
      setCaptchaError(captchaErr.error_message);
      refreshCaptcha(captchaErr.new_captcha);
    } else {
      setCaptchaError('Ошибка отправки комментария');
    }
  };

  return {
    captcha,
    captchaAnswer,
    captchaError,
    setCaptchaAnswer,
    setCaptchaError,
    refreshCaptcha,
    handleSubmitError,
  };
}
