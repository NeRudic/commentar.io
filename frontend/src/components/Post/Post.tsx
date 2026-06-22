import type { ReactNode } from "react";
import { Heart, Comment, Share, Bookmark, Dots, AIIllustration } from "../icons";
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
        <button className={styles.actionBtn} aria-label="Comment">
          <Comment size={24} />
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
  );
}
