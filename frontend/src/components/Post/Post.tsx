import { useState, type ReactNode } from "react";
import { Heart, Comment as CommentIcon, Share, Bookmark, Dots, AIIllustration } from "../icons";
import Comment from "../Comment/Comment";
import type { CommentItem } from "../Comment/Comment";
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
}

const MOCK_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    user: "ai_engineer",
    avatar: "AE",
    text: "Multi-head attention is what makes this truly powerful. Great explanation!",
    time: "2h",
    likes: 12,
    avatarColor: "#2563eb",
  },
  {
    id: "c2",
    user: "ml_student",
    avatar: "MS",
    text: "Finally understood why transformers beat RNNs. The parallelization aspect is key.",
    time: "1h",
    likes: 8,
    avatarColor: "#7c3aed",
  },
  {
    id: "c3",
    user: "data_scientist",
    avatar: "DS",
    text: "Would love to see a follow-up on positional encoding!",
    time: "45m",
    likes: 5,
    avatarColor: "#059669",
  },
];

export default function Post({
  postId,
  username,
  location,
  avatar,
  caption,
  likes,
  time,
  illustration = <AIIllustration size={468} />,
}: PostProps) {
  const [commentOpen, setCommentOpen] = useState(false);

  return (
    <>
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
          <button className={styles.actionBtn} aria-label="Comment" onClick={() => setCommentOpen(true)}>
            <CommentIcon size={24} />
          </button>
          <button className={styles.actionBtn} aria-label="Share">
            <Share size={24} />
          </button>
          <button className={`${styles.actionBtn} ${styles.saveBtn}`} aria-label="Save">
            <Bookmark size={24} />
          </button>
        </div>

        <div className={styles.likes}>{likes}</div>

        <div className={styles.caption}>
          <span className={styles.captionText}>
            <strong>{username}</strong>{" "}
            {caption}
          </span>
        </div>

        <div className={styles.time}>{time}</div>
      </article>

      {commentOpen && (
        <Comment
          postId={postId}
          postUser={username}
          postAvatar={avatar}
          postCaption={caption}
          postTime={time}
          comments={MOCK_COMMENTS}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </>
  );
}
