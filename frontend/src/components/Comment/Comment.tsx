import { memo, useState, useCallback } from 'react';
import { BASE_URL, getReplies } from '../../services';
import { sanitize } from '../../utils/sanitize';
import { MAX_DEPTH } from '../../config/comment.config';
import { useToast } from '../../context/ToastContext';
import type { CommentRow, CreateCommentResponse } from '../../types';
import Modal from '../Modal/Modal';
import CommentForm from '../CommentForm/CommentForm';
import styles from './Comment.module.css';

interface CommentProps {
  comment_id: number;
  post_id: number;
  user_name: string;
  home_page: string | null;
  text: string;
  file_path: string | null;
  created_at: string;
  reply_count: number;
  depth: number;
}

const Comment = memo(function Comment({
  comment_id,
  post_id,
  user_name,
  home_page,
  text,
  file_path,
  created_at,
  reply_count,
  depth,
}: CommentProps) {

  const [replies, setReplies] = useState<CommentRow[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const { showToast } = useToast();
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
        const data = await getReplies(comment_id);
        setReplies(data);
      } catch {
        showToast('Failed to load replies');
      } finally {
        setLoadingReplies(false);
      }
    }
  }, [showReplies, replies.length, comment_id, showToast]);

  const handleReplySuccess = useCallback((result?: CreateCommentResponse) => {
    setIsReplyFormOpen(false);
    if (result?.siblings) {
      setReplies(result.siblings);
      setShowReplies(true);
    }
  }, []);

  const effectiveReplyCount = replies.length > 0 ? replies.length : reply_count;

  return (
    <div
      className={styles.comment}
      style={{ paddingLeft: depth <= MAX_DEPTH ? 24 : 0 }}
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
        <button
          className={styles.actionBtn}
          type="button"
          onClick={() => setIsReplyFormOpen(true)}
        >
          Reply
        </button>
        {effectiveReplyCount > 0 && (
          <button
            className={styles.actionBtn}
            type="button"
            onClick={handleToggleReplies}
          >
            {showReplies
              ? 'Hide replies'
              : `Show replies (${effectiveReplyCount})`}
          </button>
        )}
      </div>
      {loadingReplies && (
        <span className={styles.loading}>Loading...</span>
      )}
      {showReplies &&
        replies.map((reply) => (
          <Comment
            key={reply.comment_id}
            {...reply}
            depth={depth + 1}
          />
        ))}
      <Modal isOpen={isReplyFormOpen} onClose={() => setIsReplyFormOpen(false)}>
        <CommentForm
          postId={post_id}
          parentCommentId={comment_id}
          onClose={() => setIsReplyFormOpen(false)}
          onSuccess={handleReplySuccess}
        />
      </Modal>
    </div>
  );
});

export default Comment;
