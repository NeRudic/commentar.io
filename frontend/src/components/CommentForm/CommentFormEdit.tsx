import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { updateComment as updateCommentSvc } from '../../services';
import { editFormSchema } from '../../schemas/commentForm.schema';
import type { EditFormValues } from '../../schemas/commentForm.schema';
import type { CommentRow, CaptchaErrorResponse } from '../../types';
import { ALLOWED_EXTENSIONS } from '../../config/file.config';
import useCaptcha from './hooks/useCaptcha';
import useFileUpload from './hooks/useFileUpload';
import CaptchaSection from './CaptchaSection';
import TextEditor from '../TextEditor/TextEditor';
import Button from '../Button/Button';
import styles from './CommentForm.module.css';

interface CommentFormEditProps {
  commentId: number;
  initialText: string;
  initialFilePaths: string[];
  onClose: () => void;
  onSuccess?: (result: CommentRow) => void;
}

export default function CommentFormEdit({
  commentId,
  initialText,
  initialFilePaths,
  onClose,
  onSuccess,
}: CommentFormEditProps) {
  const {
    captcha,
    captchaAnswer,
    captchaError,
    setCaptchaAnswer,
    setCaptchaError,
    refreshCaptcha,
  } = useCaptcha();

  const {
    selectedFiles,
    fileErrors,
    keptFilePaths,
    fileInputRef,
    addFiles,
    removeFile,
    removeKeptFile,
    uploadSelected,
  } = useFileUpload(initialFilePaths);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: valibotResolver(editFormSchema),
    defaultValues: {
      user_email: '',
      text: initialText,
    },
  });

  const onSubmit = async (data: EditFormValues) => {
    if (!captcha) return;

    try {
      const uploadPaths = await uploadSelected();
      const allPaths = [...keptFilePaths, ...uploadPaths];

      const result = await updateCommentSvc(commentId, {
        text: data.text,
        user_email: data.user_email,
        file_paths: allPaths,
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
        refreshCaptcha(captchaErr.new_captcha);
      } else {
        setCaptchaError('Ошибка отправки комментария');
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.field}>
        <label className={styles.label}>Email (подтверждение владельца)</label>
        <input className={styles.input} {...register('user_email')} />
        {errors.user_email && (
          <span className={styles.error}>{errors.user_email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Комментарий</label>
        <TextEditor
          name="text"
          initialValue={initialText}
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
          onChange={addFiles}
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

        {keptFilePaths.length > 0 && (
          <ul className={styles.fileList}>
            {keptFilePaths.map((fp) => (
              <li key={fp} className={styles.fileListItem}>
                <span className={styles.fileName}>{fp.replace(/^.*[/\\]/, '')}</span>
                <button
                  type="button"
                  className={styles.removeFileBtn}
                  onClick={() => removeKeptFile(fp)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

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

      <CaptchaSection
        captcha={captcha}
        captchaAnswer={captchaAnswer}
        captchaError={captchaError}
        onAnswerChange={setCaptchaAnswer}
      />

      <div className={styles.actions}>
        <Button className={styles.cancelBtn} onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || !captcha || !captchaAnswer.trim()}
        >
          Сохранить
        </Button>
      </div>
    </form>
  );
}
