import { memo, useState, useCallback, useRef } from 'react';
import { BASE_URL, getReplies, deleteComment } from '../../services';
import { sanitize } from '../../utils/sanitize';
import { MAX_DEPTH } from '../../config/comment.config';
import { useToast } from '../../context/ToastContext';
import type { CommentRow, CreateCommentResponse } from '../../types';
import Modal from '../Modal/Modal';
import { CommentFormCreate, CommentFormEdit } from '../CommentForm';
import Lightbox from '../Lightbox/Lightbox';
import Button from '../Button/Button';
import { File } from '../icons/icons';
import styles from './Comment.module.css';

interface CommentProps {
  comment_id: number;
  post_id: number;
  user_name: string;
  home_page: string | null;
  text: string;
  file_paths: string[];
  created_at: string;
  reply_count: number;
  depth: number;
  onDelete?: (commentId: number) => void;
  onUpdate?: (comment: CommentRow) => void;
}

const Comment = memo(function Comment({
  comment_id,
  post_id,
  user_name,
  home_page,
  text,
  file_paths,
  created_at,
  reply_count,
  depth,
  onDelete,
  onUpdate,
}: CommentProps) {

  const [replies, setReplies] = useState<CommentRow[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const { showToast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteEmailRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const handleReplySuccess = useCallback((result?: CommentRow | CreateCommentResponse) => {
    setIsReplyFormOpen(false);
    if (result && 'siblings' in result) {
      setReplies(result.siblings);
      setShowReplies(true);
    }
  }, []);

  const handleDeleteClick = useCallback(() => {
    setDeleteEmail('');
    setDeleteError(null);
    setIsDeleteModalOpen(true);
    setTimeout(() => deleteEmailRef.current?.focus(), 50);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteEmail.trim()) {
      setDeleteError('Email is required');
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteComment(comment_id, deleteEmail.trim());
      setIsDeleteModalOpen(false);
      onDelete?.(comment_id);
    } catch {
      setDeleteError('Incorrect email or server error');
    } finally {
      setDeleting(false);
    }
  }, [comment_id, deleteEmail, onDelete]);

  const handleDeleteModalClose = useCallback(() => {
    if (!deleting) setIsDeleteModalOpen(false);
  }, [deleting]);

  const handleUpdateSuccess = useCallback((result?: CommentRow | CreateCommentResponse) => {
    setIsEditFormOpen(false);
    if (result && 'comment_id' in result) {
      onUpdate?.(result);
    }
  }, [onUpdate]);

  const effectiveReplyCount = replies.length > 0 ? replies.length : reply_count;
  const isImageFile = (path: string) => /\.(jpg|jpeg|gif|png)$/i.test(path);

  return (
    <div
      className={styles.comment}
      style={{ paddingLeft: depth <= MAX_DEPTH ? 24 : 0 }}
    >
      <div className={styles.header}>
        {home_page ? (
          <a href={home_page} className={`${styles.username} ${styles.usernameLink}`} target="_blank" rel="nofollow noopener">
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
      {file_paths.length > 0 && (
        <div className={styles.fileGrid}>
          {file_paths.map((fp, i) =>
            isImageFile(fp) ? (
              <img
                key={fp}
                src={BASE_URL + fp}
                alt="attachment"
                className={styles.fileImage}
                onClick={() => setLightboxIndex(i)}
              />
            ) : (
              <a key={fp} href={BASE_URL + fp} download className={styles.fileLink}>
                <File size={16} />
                <span>{fp.replace(/^.*[\\/]/, '')}</span>
              </a>
            ),
          )}
        </div>
      )}
      {lightboxIndex !== null && (
        <Lightbox
          files={file_paths}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <div className={styles.actions}>
        <button className={styles.actionBtn} type="button" onClick={() => setIsReplyFormOpen(true)}>
          Reply
        </button>
        <button className={styles.actionBtn} type="button" onClick={() => setIsEditFormOpen(true)}>
          Edit
        </button>
        <button className={styles.actionBtn} type="button" onClick={handleDeleteClick}>
          Delete
        </button>
        {effectiveReplyCount > 0 && (
          <button className={styles.actionBtn} type="button" onClick={handleToggleReplies}>
            {showReplies ? 'Hide replies' : `Show replies (${effectiveReplyCount})`}
          </button>
        )}
      </div>
      {loadingReplies && <span className={styles.loading}>Loading...</span>}
      {showReplies &&
        replies.map((reply) => (
          <Comment
            key={reply.comment_id}
            {...reply}
            depth={depth + 1}
            onDelete={(id) => {
              setReplies((prev) => prev.filter((r) => r.comment_id !== id));
            }}
            onUpdate={(updated) => {
              setReplies((prev) =>
                prev.map((r) =>
                  r.comment_id === updated.comment_id ? updated : r,
                ),
              );
            }}
          />
        ))}
      <Modal isOpen={isReplyFormOpen} onClose={() => setIsReplyFormOpen(false)}>
        <CommentFormCreate
          postId={post_id}
          parentCommentId={comment_id}
          onClose={() => setIsReplyFormOpen(false)}
          onSuccess={handleReplySuccess}
        />
      </Modal>
      <Modal isOpen={isEditFormOpen} onClose={() => setIsEditFormOpen(false)}>
        <CommentFormEdit
          commentId={comment_id}
          initialText={text}
          initialFilePaths={file_paths}
          onClose={() => setIsEditFormOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={handleDeleteModalClose}>
        <div className={styles.deleteForm}>
          <p className={styles.deleteTitle}>Delete comment</p>
          <p className={styles.deleteText}>
            Enter your email to confirm deletion. This action cannot be undone.
          </p>
          <div className={styles.deleteField}>
            <label className={styles.deleteLabel}>Email</label>
            <input
              ref={deleteEmailRef}
              className={`${styles.deleteInput} ${deleteError ? styles.deleteInputError : ''}`}
              type="email"
              value={deleteEmail}
              onChange={(e) => {
                setDeleteEmail(e.target.value);
                setDeleteError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !deleting) handleDeleteConfirm();
              }}
              placeholder="your@email.com"
              disabled={deleting}
            />
            {deleteError && (
              <span className={styles.deleteError}>{deleteError}</span>
            )}
          </div>
          <div className={styles.deleteActions}>
            <Button className={styles.cancelBtn} onClick={handleDeleteModalClose} disabled={deleting}>
              Cancel
            </Button>
            <Button className={styles.deleteBtn} onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default Comment;
