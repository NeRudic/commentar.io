import Post from "../Post/Post";
import POSTS from "../../data/posts";
import styles from "./Blog.module.css";

export default function Blog() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI Research Blog</h1>
        <p className={styles.subtitle}>Exploring the frontiers of artificial intelligence</p>
      </header>

      <div className={styles.feed}>
        {POSTS.map((post) => (
          <Post key={post.postId} {...post} />
        ))}
      </div>
    </div>
  );
}
