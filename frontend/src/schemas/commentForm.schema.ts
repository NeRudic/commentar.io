import * as v from "valibot";
import { validateAndEscapeXHTML } from "../utils/validateXHTML";

export const formSchema = v.object({
  post_id: v.number(),
  parent_comment_id: v.nullable(v.number()),
  user_name: v.pipe(v.string(), v.nonEmpty("Имя обязательно")),
  user_email: v.pipe(
    v.string(),
    v.nonEmpty("Email обязателен"),
    v.email("Некорректный email"),
  ),
  home_page: v.nullable(v.pipe(v.string(), v.url())),
  text: v.pipe(
    v.string(),
    v.nonEmpty("Текст обязателен"),
    v.transform((val) => {
      const result = validateAndEscapeXHTML(val);
      if (!result.valid) {
        throw new Error("Некорректный XHTML: проверьте закрытие тегов");
      }
      return result.escaped;
    }),
  ),
  file_paths: v.array(v.string()),
});

export type CommentFormValues = v.InferOutput<typeof formSchema>;

export const editFormSchema = v.object({
  user_email: v.pipe(
    v.string(),
    v.nonEmpty("Email обязателен"),
    v.email("Некорректный email"),
  ),
  text: v.pipe(
    v.string(),
    v.nonEmpty("Текст обязателен"),
    v.transform((val) => {
      const result = validateAndEscapeXHTML(val);
      if (!result.valid) {
        throw new Error("Некорректный XHTML: проверьте закрытие тегов");
      }
      return result.escaped;
    }),
  ),
});

export type EditFormValues = v.InferOutput<typeof editFormSchema>;
