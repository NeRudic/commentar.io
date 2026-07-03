import { type ReactNode, useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Comment as CommentIcon,
  Share,
  Bookmark,
  Dots,
  AIIllustration,
} from '../icons/icons';
import { getComments } from '../../services';
import type { CommentRow } from '../../types';
import Modal from '../Modal/Modal';
import CommentForm from '../CommentForm/CommentForm';
import Comment from '../Comment/Comment';
import styles from './Post.module.css';

export interface PostProps {
  id: number;
  postId: string;
  username: string;
  location: string;
  avatar: string;
  caption: string;
  likes: string;
  time: string;
  illustration?: ReactNode;
}

export default function Post({
  id,
  postId,
  username,
  location,
  avatar,
  caption,
  likes,
  time,
  illustration = <AIIllustration size={468} />,
}: PostProps) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(id);
      setComments(data);
    } catch {
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchComments();
  }, [fetchComments]);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setShowComments(true);
    void fetchComments();
  }, [fetchComments]);

  const hasComments = comments.length > 0;

  return (
    <article className={styles.card} data-post-id={postId}>
      <header className={styles.header}>
        <div className={styles.avatar}>{avatar}</div>
        <div>
          <div className={styles.username}>{username}</div>
          <div className={styles.location}>{location}</div>
        </div>
        <div className={styles.spacer} />
        <button className={styles.moreBtn} aria-label="More options">
          <Dots size={20} />
        </button>
      </header>

      <div className={styles.image}>{illustration}</div>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.likeBtn}`}
          aria-label="Like"
        >
          <Heart size={24} />
        </button>
        <button
          className={styles.actionBtn}
          aria-label="Comment"
          onClick={() => setIsFormOpen(true)}
        >
          <CommentIcon size={24} />
        </button>
        <button className={styles.actionBtn} aria-label="Share">
          <Share size={24} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.saveBtn}`}
          aria-label="Save"
        >
          <Bookmark size={24} />
        </button>
      </div>

      <div className={styles.likes}>{likes}</div>

      <div className={styles.caption}>
        <span className={styles.captionText}>
          <strong>{username}</strong> {caption}
        </span>
      </div>

      {hasComments && !showComments && (
        <button
          className={styles.viewComments}
          onClick={() => setShowComments(true)}
        >
          View all {comments.length} comments
        </button>
      )}

      {showComments && comments.length > 0 && (
        <div className={styles.commentsSection}>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              user_name={comment.user_name}
              home_page={comment.home_page}
              text={comment.text}
              file_path={comment.file_path}
              created_at={comment.created_at}
            />
          ))}
        </div>
      )}

      <div className={styles.time}>{time}</div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <CommentForm
          postId={id}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </article>
  );
}
