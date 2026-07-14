import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useState, useEffect, useRef } from 'react';
import { createComment, uploadFile, getCaptcha } from '../../services';
import { formSchema } from '../../schemas/commentForm.schema';
import type { CommentFormValues } from '../../schemas/commentForm.schema';
import type { CreateCommentResponse, Captcha, CaptchaErrorResponse } from '../../types';
import { ALLOWED_TYPES, ALLOWED_EXTENSIONS, TXT_MAX_SIZE } from '../../config/file.config';
import Button from '../Button/Button';
import TextEditor from '../TextEditor/TextEditor';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  postId: number;
  parentCommentId?: number | null;
  onClose: () => void;
  onSuccess?: (result?: CreateCommentResponse) => void;
}

export default function CommentForm({
  postId,
  parentCommentId = null,
  onClose,
  onSuccess,
}: CommentFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      post_id: postId,
      parent_comment_id: parentCommentId,
      text: '',
      user_name: '',
      user_email: '',
      home_page: null,
      file_paths: [],
    },
  });

  useEffect(() => {
    getCaptcha()
      .then(setCaptcha)
      .catch(() => setCaptchaError('Не удалось загрузить капчу'));
  }, []);

  const { name: textFieldName } = register('text');

  const validateFile = (file: File): string | null => {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return 'Недопустимый тип файла. Разрешены: txt, jpg, gif, png';
    }
    if (file.type === 'text/plain' && file.size > TXT_MAX_SIZE) {
      return 'Размер txt-файла не должен превышать 100 КБ';
    }
    return null;
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length === 0) return;

    const errors: string[] = [];
    const valid: File[] = [];

    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) {
        errors.push(`${f.name}: ${err}`);
      } else {
        valid.push(f);
      }
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    setFileErrors((prev) => [...prev, ...errors]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CommentFormValues) => {
    if (!captcha) return;

    try {
      const paths: string[] = [];

      if (selectedFiles.length > 0) {
        const results = await Promise.all(
          selectedFiles.map((f) => uploadFile(f)),
        );
        paths.push(...results.map((r) => r.path));
      }

      data.file_paths = paths;

      const result = await createComment({
        ...data,
        captcha_token: captcha.token,
        captcha_answer: captchaAnswer,
      });

      onSuccess?.(result);
    } catch (err) {
      const captchaErr = (
        err as { response?: { data?: { captcha_error?: CaptchaErrorResponse } } }
      )?.response?.data?.captcha_error;

      if (captchaErr) {
        setCaptchaError(captchaErr.error_message);
        setCaptcha(captchaErr.new_captcha);
        setCaptchaAnswer('');
      } else {
        setCaptchaError('Ошибка отправки комментария');
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="hidden"
        {...register('post_id', { valueAsNumber: true })}
      />

      <div className={styles.field}>
        <label className={styles.label}>Имя</label>
        <input className={styles.input} {...register('user_name')} />
        {errors.user_name && (
          <span className={styles.error}>{errors.user_name.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} {...register('user_email')} />
        {errors.user_email && (
          <span className={styles.error}>{errors.user_email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Сайт</label>
        <input
          className={styles.input}
          {...register('home_page', {
            setValueAs: (v: string) => (v === '' ? null : v),
          })}
        />
        {errors.home_page && (
          <span className={styles.error}>{errors.home_page.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Комментарий</label>
        <TextEditor
          name={textFieldName}
          onValueChange={(v) =>
            setValue('text', v, { shouldValidate: true })
          }
        />
        {errors.text && (
          <span className={styles.error}>{errors.text.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Файлы</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleAddFiles}
          style={{ display: 'none' }}
          multiple
        />
        <Button
          type="button"
          className={styles.addFileBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          Добавить файл
        </Button>
        {selectedFiles.length > 0 && (
          <ul className={styles.fileList}>
            {selectedFiles.map((f, i) => (
              <li key={i} className={styles.fileListItem}>
                <span className={styles.fileName}>{f.name}</span>
                <button
                  type="button"
                  className={styles.removeFileBtn}
                  onClick={() => removeFile(i)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {fileErrors.length > 0 &&
          fileErrors.map((err, i) => (
            <span key={i} className={styles.error}>{err}</span>
          ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Капча</label>
        {captchaError && (
          <span className={styles.error}>{captchaError}</span>
        )}
        {captcha && (
          <div className={styles.captchaSection}>
            <span className={styles.captchaQuestion}>
              {captcha.a} + {captcha.b} = ?
            </span>
            <input
              className={styles.captchaInput}
              type="text"
              value={captchaAnswer}
              onChange={(e) => {
                setCaptchaAnswer(e.target.value.replace(/[^0-9-]/g, ''));
              }}
            />
          </div>
        )}
        {!captcha && !captchaError && <span>Загрузка капчи...</span>}
      </div>

      <div className={styles.actions}>
        <Button className={styles.cancelBtn} onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || !captchaAnswer.trim()}
        >
          Отправить
        </Button>
      </div>
    </form>
  );
}
