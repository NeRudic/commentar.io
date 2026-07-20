import { useState, useEffect } from 'react';
import { getCaptcha } from '../../../services';
import type { Captcha } from '../../../types';

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

  return {
    captcha,
    captchaAnswer,
    captchaError,
    setCaptchaAnswer,
    setCaptchaError,
    refreshCaptcha,
  };
}
