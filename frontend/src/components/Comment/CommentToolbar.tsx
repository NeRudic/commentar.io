import { Bold, Italic, Code, Link } from "../icons/icons";
import styles from "./CommentToolbar.module.css";

interface CommentToolbarProps {
  inputRef: React.RefObject<HTMLInputElement>;
  text: string;
  onChange: (text: string) => void;
}

function wrap(
  input: HTMLInputElement,
  text: string,
  open: string,
  close: string,
  onChange: (text: string) => void,
) {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const selected = text.substring(start, end);
  const newText =
    text.substring(0, start) + open + selected + close + text.substring(end);
  onChange(newText);
  requestAnimationFrame(() => {
    const cursor = start + open.length + selected.length;
    input.setSelectionRange(cursor, cursor);
    input.focus();
  });
}

const buttons: { tag: string; label: string; Icon: typeof Bold }[] = [
  { tag: "strong", label: "Bold", Icon: Bold },
  { tag: "i", label: "Italic", Icon: Italic },
  { tag: "code", label: "Code", Icon: Code },
  { tag: "a", label: "Link", Icon: Link },
];

export default function CommentToolbar({
  inputRef,
  text,
  onChange,
}: CommentToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {buttons.map(({ tag, label, Icon }) => (
        <button
          key={tag}
          className={styles.btn}
          aria-label={label}
          onClick={() => {
            const input = inputRef.current;
            if (!input) return;
            if (tag === "a") {
              const start = input.selectionStart ?? 0;
              const end = input.selectionEnd ?? 0;
              if (start === end) {
                const open = "[a]";
                const close = "[/a]";
                const placeholder = "url";
                const newText =
                  text.substring(0, start) +
                  open +
                  placeholder +
                  close +
                  text.substring(end);
                onChange(newText);
                requestAnimationFrame(() => {
                  const cursorStart = start + open.length;
                  const cursorEnd = cursorStart + placeholder.length;
                  input.setSelectionRange(cursorStart, cursorEnd);
                  input.focus();
                });
                return;
              }
            }
            wrap(input, text, `[${tag}]`, `[/${tag}]`, onChange);
          }}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
