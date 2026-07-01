import * as v from "valibot";

export const formSchema = v.object({
  post_id: v.number(),
  parent_comment_id: v.nullable(v.number()),
  user_name: v.pipe(v.string(), v.nonEmpty("Имя обязательно")),
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email обязателен"),
    v.email("Некорректный email"),
  ),
  home_page: v.nullable(v.pipe(v.string(), v.url())),
  text: v.pipe(v.string(), v.nonEmpty("Текст обязателен")),
  file_path: v.nullable(v.string()),
});

export type CommentFormValues = v.InferOutput<typeof formSchema>;
