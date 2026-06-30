import { useForm } from '@tanstack/react-form';
import createComment from '../../services/createComment';
import FormField from '../FormField/FormField';
import type { FormApiLike } from '../FormField/FormField';

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

  const form = useForm({
    defaultValues: {
      post_id: postId,
      parent_comment_id: null,
      text: '',
      user_name: '',
      user_email: '',
      home_page: '',
      file_path: null,
    },
    onSubmit: async ({ value }) => {
      await createComment(value)
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <>
            <FormField form={form as FormApiLike} name="user_name" label="Имя" />

            <button type="submit" disabled={isSubmitting}>
              Отправить
            </button>
          </>
        )}
      </form.Subscribe>
    </form>
  );
}