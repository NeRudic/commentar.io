import { useState, useEffect } from 'react';
import { getCaptcha } from '../../../services';
import type { Captcha, CaptchaErrorResponse } from '../../../types';

export default function useCaptcha() {
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getCaptcha()
      .then(setCaptcha)
      .catch(() => setCaptchaError('Не удалось загрузить капчу'));

    return () => controller.abort();
  }, []);

  const refreshCaptcha = (newCaptcha: Captcha) => {
    setCaptcha(newCaptcha);
    setCaptchaAnswer('');
  };

  const handleSubmitError = (err: unknown) => {
    const captchaErr = (
      err as { response?: { data?: { captcha_error?: CaptchaErrorResponse } } }
    )?.response?.data?.captcha_error;

    if (captchaErr) {
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
