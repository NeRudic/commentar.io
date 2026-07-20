import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { createComment as createCommentSvc } from '../../services';
import { formSchema } from '../../schemas/commentForm.schema';
import type { CommentFormValues } from '../../schemas/commentForm.schema';
import type { CreateCommentResponse } from '../../types';
import { ALLOWED_EXTENSIONS } from '../../config/file.config';
import useCaptcha from './hooks/useCaptcha';
import useFileUpload from './hooks/useFileUpload';
import CaptchaSection from './CaptchaSection';
import FileList from './FileList';
import TextEditor from '../TextEditor/TextEditor';
import Button from '../Button/Button';
import styles from './CommentForm.module.css';

interface CommentFormCreateProps {
  postId: number;
  parentCommentId?: number | null;
  onClose: () => void;
  onSuccess?: (result: CreateCommentResponse) => void;
}

export default function CommentFormCreate({
  postId,
  parentCommentId = null,
  onClose,
  onSuccess,
}: CommentFormCreateProps) {
  const {
    captcha,
    captchaAnswer,
    captchaError,
    setCaptchaAnswer,
    handleSubmitError,
  } = useCaptcha();

  const {
    selectedFiles,
    fileErrors,
    fileInputRef,
    addFiles,
    removeFile,
    uploadSelected,
  } = useFileUpload();

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

  const onSubmit = async (data: CommentFormValues) => {
    if (!captcha) return;

    try {
      const uploadPaths = await uploadSelected();
      data.file_paths = uploadPaths;

      const result = await createCommentSvc({
        ...data,
        captcha_token: captcha.token,
        captcha_answer: captchaAnswer,
      });
      onSuccess?.(result);
    } catch (err) {
      handleSubmitError(err);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="hidden"
        {...register('post_id', { valueAsNumber: true })}
      />
      <input
        type="hidden"
        {...register('parent_comment_id')}
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
          name="text"
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

        <FileList
          items={selectedFiles.map((f, i) => ({
            name: f.name,
            onRemove: () => removeFile(i),
          }))}
        />

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
          Отправить
        </Button>
      </div>
    </form>
  );
}
