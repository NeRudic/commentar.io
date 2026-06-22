import Post from "../Post/Post";
import { AIIllustration, DiffusionIllustration, RLIllustration } from "../icons";
import styles from "./Blog.module.css";

const POSTS = [
  {
    postId: "post-001",
    username: "neural_research",
    location: "San Francisco, CA",
    avatar: "NR",
    likes: "2,847 likes",
    time: "2 hours ago",
    illustration: <AIIllustration size={468} label="Neural Network Architecture" />,
    caption:
      '🧠 The attention mechanism, introduced in 2017, revolutionized language processing. Instead of reading sequentially, transformers analyze all words at once, computing relevance scores between every pair of tokens.\n\nThis parallel processing lets models like GPT-4 capture dependencies RNNs couldn\'t. Each attention head learns distinct patterns — syntax, semantics, context.\n\nSelf-attention lets each word weight every other word dynamically. That\'s why modern LLMs grasp context so deeply.',
  },
  {
    postId: "post-002",
    username: "diffusion_lab",
    location: "London, UK",
    avatar: "DL",
    likes: "1,923 likes",
    time: "5 hours ago",
    illustration: <DiffusionIllustration size={468} label="Diffusion Process" />,
    caption:
      '🖼️ Diffusion models generate images by reversing a noise-adding process. Starting from pure Gaussian noise, the model gradually denoises step by step — like sculpting a statue from a block of marble.\n\nThe key insight: teach a model to predict the noise added at each step. Once trained, it can turn random noise into coherent images by subtracting predicted noise iteratively.\n\nStable Diffusion, DALL-E 3, and Midjourney all use variants of this approach. The math is elegant: it\'s all about estimating the score function of the data distribution.',
  },
  {
    postId: "post-003",
    username: "rl_explorer",
    location: "Berlin, Germany",
    avatar: "RL",
    likes: "3,102 likes",
    time: "8 hours ago",
    illustration: <RLIllustration size={468} label="Reinforcement Learning" />,
    caption:
      '🎮 Reinforcement Learning teaches agents through trial and error. An agent takes actions in an environment, receives rewards or penalties, and learns a policy that maximizes cumulative reward over time.\n\nDeep RL combines neural networks with RL algorithms like PPO and SAC. This is how AlphaGo mastered Go and how robots learn to walk.\n\nThe exploration-exploitation dilemma is central: should the agent try something new or stick with what works? Solving this efficiently is what makes modern RL so powerful.',
  },
];

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
