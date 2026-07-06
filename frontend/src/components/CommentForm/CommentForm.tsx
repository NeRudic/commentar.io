import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useState } from 'react';
import { createComment, uploadFile } from '../../services';
import { formSchema } from '../../schemas/commentForm.schema';
import type { CommentFormValues } from '../../schemas/commentForm.schema';
import type { CreateCommentResponse } from '../../types';
import { ALLOWED_TYPES, ALLOWED_EXTENSIONS, TXT_MAX_SIZE } from '../../config/file.config';
import { useCaptcha } from '../../hooks/useCaptcha';
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
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

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
      email: '',
      home_page: null,
      file_path: null,
    },
  });

  const captcha = useCaptcha();

  const { name: textFieldName } = register('text');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }

    if (!(ALLOWED_TYPES as readonly string[]).includes(selected.type)) {
      setFileError('Недопустимый тип файла. Разрешены: txt, jpg, gif, png');
      setFile(null);
      return;
    }

    if (selected.type === 'text/plain' && selected.size > TXT_MAX_SIZE) {
      setFileError('Размер txt-файла не должен превышать 100 КБ');
      setFile(null);
      return;
    }

    setFile(selected);
    setFileError(null);
    setFileUploading(true);

    try {
      const { path } = await uploadFile(selected);
      setValue('file_path', path);
    } catch {
      setFileError('Ошибка загрузки файла');
      setFile(null);
      setValue('file_path', null);
    } finally {
      setFileUploading(false);
    }
  };

  const onSubmit = async (data: CommentFormValues) => {
    if (!captcha.captcha) return;

    const result = await createComment({
      post_id: data.post_id,
      parent_comment_id: data.parent_comment_id,
      user_name: data.user_name,
      user_email: data.email,
      home_page: data.home_page ?? null,
      text: data.text,
      file_path: data.file_path,
      captcha_token: captcha.captcha.token,
      captcha_answer: captchaAnswer,
    });

    onSuccess?.(result);
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
        <input className={styles.input} {...register('email')} />
        {errors.email && (
          <span className={styles.error}>{errors.email.message}</span>
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
        <label className={styles.label}>Файл</label>
        <input
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleFileChange}
          disabled={fileUploading}
        />
        {fileUploading && <span>Загрузка...</span>}
        {file && <span className={styles.fileName}>{file.name}</span>}
        {fileError && <span className={styles.error}>{fileError}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Капча</label>
        {captcha.systemError && (
          <span className={styles.error}>{captcha.systemError}</span>
        )}
        {captcha.captcha && !captcha.systemError && (
          <div className={styles.captchaSection}>
            <span className={styles.captchaQuestion}>
              {captcha.captcha.a} + {captcha.captcha.b} = ?
            </span>
            <input
              className={styles.captchaInput}
              type="text"
              value={captchaAnswer}
              onChange={(e) => {
                setCaptchaAnswer(e.target.value.replace(/[^0-9-]/g, ''));
              }}
              disabled={captcha.verifyResult === true}
            />
            {captcha.verifyResult ? (
              <span className={styles.verifySuccess}>&#10003;</span>
            ) : (
              <Button
                className={styles.verifyBtn}
                onClick={() => captcha.verify(captchaAnswer)}
                disabled={captcha.isVerifying || !captchaAnswer.trim()}
              >
                {captcha.isVerifying ? '...' : 'Проверить'}
              </Button>
            )}
            <Button
              className={styles.verifyBtn}
              onClick={() => {
                setCaptchaAnswer('');
                captcha.reloadCaptcha();
              }}
            >
              &#8634;
            </Button>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button className={styles.cancelBtn} onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || captcha.verifyResult !== true}
        >
          Отправить
        </Button>
      </div>
    </form>
  );
}
