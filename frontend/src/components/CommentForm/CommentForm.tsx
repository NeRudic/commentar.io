import { useForm } from 'react-hook-form';
import createComment from '../../services/createComment';
import type { Captcha, CreateCommentRequest } from '../../types';
import { useEffect, useState } from 'react';
import { getCaptcha, verifyCaptcha } from '../../services/captcha';

interface CommentFormProps {
  postId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CommentForm({
  postId,
  onClose,
  onSuccess,
}: CommentFormProps) {
  void onClose;

  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['text/plain', 'image/jpeg', 'image/gif', 'image/png'];
  const ALLOWED_EXTENSIONS = '.txt,.jpg,.jpeg,.gif,.png';
  const TXT_MAX_SIZE = 100 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
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
  };

  const refreshCaptcha = () => {
    setCaptchaAnswer('');
    setCaptchaError(null);
    getCaptcha().then(setCaptcha);
  };

  useEffect(() => {
    getCaptcha().then(setCaptcha);
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommentRequest>({
    defaultValues: {
      post_id: postId,
      parent_comment_id: null,
      text: '',
      user_name: '',
      user_email: '',
      home_page: '',
      file_path: null,
    },
  });

  const onSubmit = async (data: CreateCommentRequest) => {
    if (!captcha) return;

    const { valid } = await verifyCaptcha(captcha.token, captchaAnswer);
    if (!valid) {
      setCaptchaError('Неверный ответ');
      refreshCaptcha();
      return;
    }

    await createComment(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('post_id')} />

      <label>
        Имя
        <input {...register('user_name')} />
        {errors.user_name && <span>{errors.user_name.message}</span>}
      </label>

      <label>
        Email
        <input {...register('user_email')} />
        {errors.user_email && <span>{errors.user_email.message}</span>}
      </label>

      <label>
        Сайт
        <input {...register('home_page')} />
        {errors.home_page && <span>{errors.home_page.message}</span>}
      </label>

      <label>
        Комментарий
        <textarea {...register('text')} />
        {errors.text && <span>{errors.text.message}</span>}
      </label>

      <label>
        Файл
        <input
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleFileChange}
        />
        {file && <span>{file.name}</span>}
        {fileError && <span>{fileError}</span>}
      </label>

      {captcha && (
        <div className="captcha">
          <span>
            Сколько будет {captcha.a} + {captcha.b}?
          </span>
          <input
            type="text"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
          />
          {captchaError && <span>{captchaError}</span>}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        Отправить
      </button>
    </form>
  );
}
