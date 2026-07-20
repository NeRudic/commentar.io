import type { Captcha } from '../../types';
import styles from './CommentForm.module.css';

interface CaptchaSectionProps {
  captcha: Captcha | null;
  captchaAnswer: string;
  captchaError: string | null;
  onAnswerChange: (value: string) => void;
}

export default function CaptchaSection({
  captcha,
  captchaAnswer,
  captchaError,
  onAnswerChange,
}: CaptchaSectionProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>Капча</label>
      {captchaError && (
        <span className={styles.error}>{captchaError}</span>
      )}
      {captcha && (
        <div className={styles.captchaSection}>
          <img
            className={styles.captchaImage}
            src={`data:image/svg+xml,${encodeURIComponent(captcha.svg)}`}
            alt="Captcha"
          />
          <input
            className={styles.captchaInput}
            type="text"
            value={captchaAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
          />
        </div>
      )}
      {!captcha && !captchaError && <span>Загрузка капчи...</span>}
    </div>
  );
}
