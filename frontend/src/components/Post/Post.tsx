import { useState, useRef, useEffect, type ReactNode } from "react";
import { Heart, Comment as CommentIcon, Share, Bookmark, Dots, AIIllustration } from "../icons/icons";
import CommentSection from "../Comment/Comment";
import type { ReplyData } from "../Comment/Comment";
import styles from "./Post.module.css";

export interface PostProps {
  postId: string;
  username: string;
  location: string;
  avatar: string;
  caption: string;
  likes: string;
  time: string;
  illustration?: ReactNode;
  initialComments?: ReplyData[];
  commentOpen?: boolean;
  onCommentClick?: () => void;
}

export default function Post({
  postId,
  username,
  location,
  avatar,
  caption,
  likes,
  time,
  illustration = <AIIllustration size={468} />,
  initialComments = [],
  commentOpen = false,
  onCommentClick,
}: PostProps) {
  const [comments, setComments] = useState<ReplyData[]>(initialComments);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentOpen) {
      commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [commentOpen]);

  function countAll(list: ReplyData[]): number {
    let n = 0;
    for (const c of list) {
      n++;
      n += countAll(c.replies);
    }
    return n;
  }

  function addComment(parentId: string, text: string) {
    const newComment: ReplyData = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: "you",
      text,
      time: "just now",
      replies: [],
    };

    setComments((prev) => {
      if (parentId === "root") return [newComment, ...prev];

      function addRecursive(list: ReplyData[]): ReplyData[] {
        return list.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...c.replies, newComment] };
          }
          return { ...c, replies: addRecursive(c.replies) };
        });
      }
      return addRecursive(prev);
    });
  }

  const commentCount = countAll(comments);

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
        <button className={`${styles.actionBtn} ${styles.likeBtn}`} aria-label="Like">
          <Heart size={24} />
        </button>
        <button
          className={styles.actionBtn}
          aria-label="Comment"
          onClick={onCommentClick}
        >
          <CommentIcon size={24} />
        </button>
        <button className={styles.actionBtn} aria-label="Share">
          <Share size={24} />
        </button>
        <button className={`${styles.actionBtn} ${styles.saveBtn}`} aria-label="Save">
          <Bookmark size={24} />
        </button>
      </div>

      <div className={styles.likes}>
        {likes}
        {commentCount > 0 && <span className={styles.commentCount}>, {commentCount} comment{commentCount !== 1 ? "s" : ""}</span>}
      </div>

      <div className={styles.caption}>
        <span className={styles.captionText}>
          <strong>{username}</strong>{" "}
          {caption}
        </span>
      </div>

      <div className={styles.time}>{time}</div>

      {commentOpen && (
        <div ref={commentRef}>
          <CommentSection
            comments={comments}
            onAddReply={addComment}
          />
        </div>
      )}
    </article>
  );
}
