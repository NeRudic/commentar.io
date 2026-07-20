import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { getRootComments } from '../../services';
import { COMMENTS_PER_PAGE } from '../../config/comment.config';
import { useToast } from '../../context/ToastContext';
import type { CommentRow } from '../../types';
import Modal from '../Modal/Modal';
import { CommentFormCreate } from '../CommentForm';
import Comment from '../Comment/Comment';
import styles from './CommentSection.module.css';

type SortField = 'user_name' | 'email' | 'created_at';

interface SortConfig {
  field: SortField;
  order: 'asc' | 'desc';
}

const SORT_LABELS: Record<SortField, string> = {
  user_name: 'User Name',
  email: 'E-mail',
  created_at: 'Date',
};

interface CommentSectionProps {
  postId: number;
}

export interface CommentSectionHandle {
  handleIconClick: () => void;
}

const CommentSection = forwardRef<CommentSectionHandle, CommentSectionProps>(
  function CommentSection({ postId }, ref) {
    const [rootComments, setRootComments] = useState<CommentRow[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sort, setSort] = useState<SortConfig>({
      field: 'created_at',
      order: 'desc',
    });
    const { showToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        handleIconClick() {
          if (rootComments.length === 0) {
            setIsFormOpen(true);
          } else {
            containerRef.current?.scrollIntoView({ block: 'center' });
          }
        },
      }),
      [rootComments.length],
    );

    const fetchRootComments = useCallback(
      async (limit: number, offset: number) => {
        try {
          const data = await getRootComments(
            postId,
            limit,
            offset,
            sort.field,
            sort.order,
          );
          if (offset === 0) {
            setRootComments(data);
          } else {
            setRootComments((prev) => [...prev, ...data]);
          }
          setHasMore(data.length === limit);
        } catch {
          showToast('Failed to load comments');
        }
      },
      [postId, sort, showToast],
    );

    useEffect(() => {
      fetchRootComments(COMMENTS_PER_PAGE, 0);
    }, [fetchRootComments]);

    const handleSort = useCallback(
      (field: SortField) => {
        setSort((prev) => {
          const order =
            prev.field === field && prev.order === 'asc' ? 'desc' : 'asc';
          return { field, order };
        });
        setRootComments([]);
        setHasMore(false);
      },
      [],
    );

    const handleShowMore = useCallback(async () => {
      setLoadingMore(true);
      await fetchRootComments(COMMENTS_PER_PAGE, rootComments.length);
      setLoadingMore(false);
    }, [fetchRootComments, rootComments.length]);

    const handleDeleteRoot = useCallback((commentId: number) => {
      setRootComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    }, []);

    const handleUpdateRoot = useCallback((updated: CommentRow) => {
      setRootComments((prev) =>
        prev.map((c) =>
          c.comment_id === updated.comment_id ? updated : c,
        ),
      );
    }, []);

    const handleFormSuccess = useCallback(
      (result?: CommentRow | { comment: CommentRow; siblings: CommentRow[] }) => {
        setIsFormOpen(false);
        if (result && 'siblings' in result) {
          setRootComments(result.siblings);
        }
      },
      [],
    );

    const handleNewComment = useCallback(() => {
      setIsFormOpen(true);
    }, []);

    return (
      <div className={styles.section}>
        <div className={styles.sortBar}>
          {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
            <button
              key={field}
              type="button"
              className={`${styles.sortBtn} ${sort.field === field ? styles.sortBtnActive : ''}`}
              onClick={() => handleSort(field)}
            >
              {SORT_LABELS[field]}
              {sort.field === field && (
                <span className={styles.sortArrow}>
                  {sort.order === 'asc' ? ' ↑' : ' ↓'}
                </span>
              )}
            </button>
          ))}
        </div>

        <div ref={containerRef}>
          {rootComments.length > 0 && (
            <div className={styles.commentsList}>
              {rootComments.map((comment) => (
                <Comment
                  key={comment.comment_id}
                  comment_id={comment.comment_id}
                  post_id={comment.post_id}
                  user_name={comment.user_name}
                  user_email={comment.user_email}
                  home_page={comment.home_page}
                  text={comment.text}
                  file_paths={comment.file_paths}
                  created_at={comment.created_at}
                  reply_count={comment.reply_count}
                  depth={0}
                  onDelete={handleDeleteRoot}
                  onUpdate={handleUpdateRoot}
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
        </div>

        <button
          className={styles.addComment}
          type="button"
          onClick={handleNewComment}
        >
          Add comment
        </button>

        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <CommentFormCreate
            postId={postId}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </Modal>
      </div>
    );
  },
);

export default CommentSection;
