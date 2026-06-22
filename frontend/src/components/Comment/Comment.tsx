import { useEffect, useRef } from "react";
import { Heart } from "../icons";
import styles from "./Comment.module.css";

export interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  avatarColor: string;
}

export interface CommentProps {
  postId: string;
  postUser: string;
  postAvatar: string;
  postCaption: string;
  postTime: string;
  comments: CommentItem[];
  onClose: () => void;
}

export default function Comment({
  postUser,
  postAvatar,
  postCaption,
  postTime,
  comments,
  onClose,
}: CommentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>Comments</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className={styles.preview}>
          <div className={styles.previewAvatar}>{postAvatar}</div>
          <div className={styles.previewBody}>
            <span className={styles.previewUser}>{postUser}</span>
            <span>{postCaption}</span>
            <div className={styles.previewTime}>{postTime}</div>
          </div>
        </div>

        <div className={styles.list}>
          {comments.length === 0 ? (
            <div className={styles.empty}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className={styles.emptyText}>No comments yet</span>
              <span className={styles.emptySub}>Start the conversation.</span>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentAvatar} style={{ background: c.avatarColor }}>
                  {c.avatar}
                </div>
                <div className={styles.commentBody}>
                  <span className={styles.commentUser}>{c.user}</span>
                  {c.text}
                  <div className={styles.commentTime}>
                    {c.time}
                    {c.likes > 0 && <> · <span className={styles.commentLikes}>{c.likes} likes</span></>}
                  </div>
                </div>
                <button className={styles.heartBtn} aria-label="Like comment">
                  <Heart size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.inputBar}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Add a comment…"
          />
          <button className={styles.postBtn} disabled>Post</button>
        </div>
      </div>
    </div>
  );
}
