import styles from './CommentForm.module.css';

interface FileListItem {
  name: string;
  onRemove: () => void;
}

interface FileListProps {
  items: FileListItem[];
}

export default function FileList({ items }: FileListProps) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.fileList}>
      {items.map((item, i) => (
        <li key={i} className={styles.fileListItem}>
          <span className={styles.fileName}>{item.name}</span>
          <button
            type="button"
            className={styles.removeFileBtn}
            onClick={item.onRemove}
            aria-label="Remove file"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
