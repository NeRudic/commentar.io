import { memo, useState, useCallback, useEffect } from 'react';
import { BASE_URL, getReplies } from '../../services';
import { sanitize } from '../../utils/sanitize';
import { MAX_DEPTH } from '../../config/comment.config';
import type { CommentRow } from '../../types';
import styles from './Comment.module.css';

interface CommentProps {
  id: number;
  user_name: string;
  home_page: string | null;
  text: string;
  file_path: string | null;
  created_at: string;
  reply_count: number;
  depth: number;
  onReply: (id: number) => void;
  refreshToken: number;
}

const Comment = memo(function Comment({
  id,
  user_name,
  home_page,
  text,
  file_path,
  created_at,
  reply_count,
  depth,
  onReply,
  refreshToken,
}: CommentProps) {
  const [replies, setReplies] = useState<CommentRow[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isImage = /\.(jpg|jpeg|gif|png)$/i.test(file_path ?? '');

  const handleToggleReplies = useCallback(async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);
    if (replies.length === 0) {
      setLoadingReplies(true);
      try {
        const data = await getReplies(id);
        setReplies(data);
      } catch {
        // silently fail
      } finally {
        setLoadingReplies(false);
      }
    }
  }, [showReplies, replies.length, id]);

  useEffect(() => {
    if (showReplies && refreshToken > 0) {
      getReplies(id).then(setReplies).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const canReply = depth < MAX_DEPTH;

  return (
    <div
      className={styles.comment}
      style={{ paddingLeft: depth * 24 }}
    >
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
      <div className={styles.actions}>
        {canReply && (
          <button
            className={styles.actionBtn}
            type="button"
            onClick={() => onReply(id)}
          >
            Reply
          </button>
        )}
        {reply_count > 0 && (
          <button
            className={styles.actionBtn}
            type="button"
            onClick={handleToggleReplies}
          >
            {showReplies
              ? 'Hide replies'
              : `Show replies (${reply_count})`}
          </button>
        )}
      </div>
      {loadingReplies && (
        <span className={styles.loading}>Loading...</span>
      )}
      {showReplies &&
        replies.map((reply) => (
          <Comment
            key={reply.id}
            id={reply.id}
            user_name={reply.user_name}
            home_page={reply.home_page}
            text={reply.text}
            file_path={reply.file_path}
            created_at={reply.created_at}
            reply_count={reply.reply_count}
            depth={depth + 1}
            onReply={onReply}
            refreshToken={refreshToken}
          />
        ))}
    </div>
  );
});

export default Comment;
