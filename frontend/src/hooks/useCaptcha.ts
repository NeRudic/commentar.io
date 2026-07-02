import { useCallback, useEffect, useState } from "react";

import { getCaptcha, verifyCaptcha } from "../services/captcha";
import type { Captcha } from "../types";

interface UseCaptchaReturn {
  captcha: Captcha | null;
  isVerifying: boolean;
  verifyResult: boolean | null;
  systemError: string | null;

  fetchCaptcha: () => Promise<void>;
  reloadCaptcha: () => Promise<void>;
  verify: (answer: string) => Promise<boolean>;
}

export function useCaptcha(): UseCaptchaReturn {
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  const fetchCaptcha = useCallback(async () => {
    try {
      const captcha = await getCaptcha();

      setCaptcha(captcha);
      setVerifyResult(null);
      setSystemError(null);
    } catch {
      setSystemError(
        "Не удалось загрузить капчу. Попробуйте обновить страницу.",
      );
    }
  }, []);

  const reloadCaptcha = useCallback(async () => {
    setCaptcha(null);
    setVerifyResult(null);
    setSystemError(null);

    await fetchCaptcha();
  }, [fetchCaptcha]);

  const verify = useCallback(
    async (answer: string): Promise<boolean> => {
      if (!captcha || isVerifying || !answer.trim()) {
        return false;
      }

      setIsVerifying(true);
      setSystemError(null);

      try {
        const { valid } = await verifyCaptcha(captcha.token, answer);

        setVerifyResult(valid);

        if (!valid) {
          await reloadCaptcha();
        }

        return valid;
      } catch {
        setSystemError("Не удалось проверить капчу. Попробуйте ещё раз.");

        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [captcha, isVerifying, reloadCaptcha],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCaptcha();
  }, [fetchCaptcha]);

  return {
    captcha,
    isVerifying,
    verifyResult,
    systemError,
    fetchCaptcha,
    reloadCaptcha,
    verify,
  };
}
