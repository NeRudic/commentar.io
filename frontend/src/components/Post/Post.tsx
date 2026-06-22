import { Heart, Comment, Share, Bookmark, Dots, AIIllustration } from "../icons";
import styles from "./Post.module.css";

export default function Post() {
  return (
    <article className={styles.card}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>AI</div>
        <div>
          <div className={styles.username}>neural_research</div>
          <div className={styles.location}>San Francisco, CA</div>
        </div>
        <div className={styles.spacer} />
        <button className={styles.moreBtn} aria-label="More options">
          <Dots size={20} />
        </button>
      </header>

      {/* Illustration */}
      <div className={styles.image}>
        <AIIllustration size={468} />
      </div>

      {/* Actions */}
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

      {/* Likes */}
      <div className={styles.likes}>2,847 likes</div>

      {/* Caption */}
      <div className={styles.caption}>
        <span className={styles.captionText}>
          <strong>neural_research</strong>{" "}
          🧠 The attention mechanism, introduced in 2017, revolutionized language
          processing. Instead of reading sequentially, transformers analyze all
          words at once, computing relevance scores between every pair of
          tokens.
          {"\n\n"}
          This parallel processing lets models like GPT-4 capture dependencies
          RNNs couldn't. Each attention head learns distinct patterns — syntax,
          semantics, context.
          {"\n\n"}
          Self-attention lets each word weight every other word dynamically.
          That's why modern LLMs grasp context so deeply.
        </span>
      </div>

      {/* Comments */}
      <div className={styles.comments}>
        <button className={styles.viewAll}>View all 42 comments</button>
        <div className={styles.commentRow}>
          <span className={styles.commentUser}>ai_engineer</span>
          Multi-head attention is what makes this truly powerful. Great
          explanation!
        </div>
        <div className={styles.commentRow}>
          <span className={styles.commentUser}>ml_student</span>
          Finally understood why transformers beat RNNs. The parallelization
          aspect is key.
        </div>
      </div>

      {/* Time */}
      <div className={styles.time}>2 hours ago</div>

      {/* Add comment */}
      <div className={styles.addComment}>
        <button className={styles.emojiBtn} aria-label="Add emoji">
          😊
        </button>
        <input
          className={styles.commentInput}
          type="text"
          placeholder="Add a comment…"
        />
        <button className={styles.postBtn}>Post</button>
      </div>
    </article>
  );
}
