import { BASE_URL } from '../../services';
import { sanitize } from '../../utils/sanitize';
import styles from './Comment.module.css';

interface CommentProps {
  user_name: string;
  home_page: string | null;
  text: string;
  file_path: string | null;
  created_at: string;
}

export default function Comment({
  user_name,
  home_page,
  text,
  file_path,
  created_at,
}: CommentProps) {
  const isImage = /\.(jpg|jpeg|gif|png)$/i.test(file_path ?? '');

  return (
    <div className={styles.comment}>
      <div className={styles.header}>
        {home_page ? (
          <a
            href={home_page}
            className={styles.username}
            target="_blank"
            rel="nofollow noopener"
          >
            {user_name}
          </a>
        ) : (
          <span className={styles.username}>{user_name}</span>
        )}
        <span className={styles.date}>
          {new Date(created_at).toLocaleString()}
        </span>
      </div>
      <div
        className={styles.text}
        dangerouslySetInnerHTML={{ __html: sanitize(text) }}
      />
      {file_path && (
        <div className={styles.file}>
          {isImage ? (
            <img
              src={BASE_URL + file_path}
              alt="attachment"
              className={styles.image}
            />
          ) : (
            <a
              href={BASE_URL + file_path}
              target="_blank"
              className={styles.fileLink}
            >
              {file_path}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
