import { useRef, useCallback, useState } from 'react';
import Button from '../Button/Button';
import { sanitize } from '../../utils/sanitize';
import styles from './TextEditor.module.css';

interface TextEditorProps {
  name?: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
}

const TAGS = [
  { title: 'Italic', open: '<i>', close: '</i>', label: 'i' },
  { title: 'Bold', open: '<strong>', close: '</strong>', label: 'b' },
  { title: 'Code', open: '<code>', close: '</code>', label: 'code' },
  { title: 'Link', open: '<a href="" title="">', close: '</a>', label: 'a' },
];

export default function TextEditor({ name, initialValue = '', onValueChange }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = useCallback(() => {
    const value = textareaRef.current?.value ?? '';
    setText(value);
    onValueChange?.(value);
  }, [onValueChange]);

  const wrapTag = useCallback(
    (open: string, close: string) => {
      if (!textareaRef.current) return;

      const ta = textareaRef.current;
      const { selectionStart: start, selectionEnd: end, value } = ta;

      const selected = value.slice(start, end);
      const before = value.slice(0, start);
      const after = value.slice(end);
      const inserted = selected ? open + selected + close : open + close;

      const newValue = before + inserted + after;
      ta.value = newValue;
      setText(newValue);
      onValueChange?.(newValue);

      const cursor = selected
        ? start + inserted.length
        : start + open.length;
      ta.setSelectionRange(cursor, cursor);
      ta.focus();
    },
    [onValueChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        {!isPreview &&
          TAGS.map(({ label, open, close, title }) => (
            <Button
              key={title}
              className={styles.toolbarBtn}
              title={title}
              onClick={() => wrapTag(open, close)}
            >
              [{label}]
            </Button>
          ))}
        <div className={styles.spacer} />
        <Button
          className={`${styles.toolbarBtn} ${isPreview ? styles.active : ''}`}
          title={isPreview ? 'Back to edit' : 'Preview'}
          onClick={() => setIsPreview((p) => !p)}
        >
          {isPreview ? '[edit]' : '[preview]'}
        </Button>
      </div>
      {isPreview ? (
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{
            __html: sanitize(text),
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          name={name}
          className={styles.textarea}
          onChange={handleChange}
          defaultValue={text}
        />
      )}
    </div>
  );
}
