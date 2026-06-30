import { useForm } from 'react-hook-form';
import createComment from '../../services/createComment';
import type { Captcha, CreateCommentRequest } from '../../types';
import { useState } from 'react';
import { getCaptcha } from '../../services/captcha';

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
  void onSuccess;

  const [captcha, setCaptcha] = useState<Captcha>();



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
    await createComment(data);
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

      <div className="captcha">

      </div>

      <button type="submit" disabled={isSubmitting}>
        Отправить
      </button>
    </form>
  );
}
