import { useState, useEffect, useCallback } from 'react';
import { getRootComments } from '../../services';
import { COMMENTS_PER_PAGE } from '../../config/comment.config';
import type { CommentRow, CreateCommentResponse } from '../../types';
import Modal from '../Modal/Modal';
import CommentForm from '../CommentForm/CommentForm';
import Comment from '../Comment/Comment';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [rootComments, setRootComments] = useState<CommentRow[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchRootComments = useCallback(
    async (limit: number, offset: number) => {
      try {
        const data = await getRootComments(postId, limit, offset);
        if (offset === 0) {
          setRootComments(data);
        } else {
          setRootComments((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      } catch {
        // silently fail
      }
    },
    [postId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRootComments(COMMENTS_PER_PAGE, 0);
  }, [fetchRootComments]);

  const handleShowMore = useCallback(async () => {
    setLoadingMore(true);
    await fetchRootComments(COMMENTS_PER_PAGE, rootComments.length);
    setLoadingMore(false);
  }, [fetchRootComments, rootComments.length]);

  const handleReply = useCallback((commentId: number) => {
    setReplyTo(commentId);
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback(
    (result?: CreateCommentResponse) => {
      setIsFormOpen(false);
      setReplyTo(null);
      if (result?.siblings) {
        if (replyTo === null) {
          setRootComments(result.siblings);
          setShowComments(true);
        } else {
          setRefreshToken((t) => t + 1);
        }
      }
    },
    [replyTo],
  );

  const handleNewComment = useCallback(() => {
    setReplyTo(null);
    setIsFormOpen(true);
  }, []);

  const hasComments = rootComments.length > 0;

  return (
    <div className={styles.section}>
      {hasComments && !showComments && (
        <button
          className={styles.viewComments}
          type="button"
          onClick={() => setShowComments(true)}
        >
          View all {rootComments.length} comments
        </button>
      )}

      {showComments && rootComments.length > 0 && (
        <div className={styles.commentsList}>
          {rootComments.map((comment) => (
            <Comment
              key={comment.id}
              id={comment.id}
              user_name={comment.user_name}
              home_page={comment.home_page}
              text={comment.text}
              file_path={comment.file_path}
              created_at={comment.created_at}
              reply_count={comment.reply_count}
              depth={0}
              onReply={handleReply}
              refreshToken={refreshToken}
            />
          ))}
          {hasMore && (
            <button
              className={styles.showMore}
              type="button"
              onClick={handleShowMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Show more'}
            </button>
          )}
        </div>
      )}

      <button
        className={styles.addComment}
        type="button"
        onClick={handleNewComment}
      >
        Add comment
      </button>

      <Modal isOpen={isFormOpen} onClose={() => {
        setIsFormOpen(false);
        setReplyTo(null);
      }}>
        <CommentForm
          postId={postId}
          parentCommentId={replyTo}
          onClose={() => {
            setIsFormOpen(false);
            setReplyTo(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
}
