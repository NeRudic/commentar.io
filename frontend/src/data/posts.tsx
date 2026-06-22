import type { ReactNode } from "react";
import { AIIllustration, DiffusionIllustration, RLIllustration } from "../components/icons/icons";
import type { ReplyData } from "../components/Comment/Comment";

export interface PostData {
  postId: string;
  username: string;
  location: string;
  avatar: string;
  likes: string;
  time: string;
  illustration: ReactNode;
  caption: string;
  initialComments: ReplyData[];
}

const POSTS: PostData[] = [
  {
    postId: "post-001",
    username: "neural_research",
    location: "San Francisco, CA",
    avatar: "NR",
    likes: "2,847 likes",
    time: "2 hours ago",
    illustration: <AIIllustration size={468} label="Neural Network Architecture" />,
    caption:
      "🧠 The attention mechanism, introduced in 2017, revolutionized language processing. Instead of reading sequentially, transformers analyze all words at once, computing relevance scores between every pair of tokens.\n\nThis parallel processing lets models like GPT-4 capture dependencies RNNs couldn't. Each attention head learns distinct patterns — syntax, semantics, context.\n\nSelf-attention lets each word weight every other word dynamically. That's why modern LLMs grasp context so deeply.",
    initialComments: [
      {
        id: "c1",
        username: "ai_engineer",
        text: "Multi-head attention is what makes this truly powerful. Great explanation!",
        time: "1h ago",
        replies: [
          {
            id: "c1r1",
            username: "neural_research",
            text: "Absolutely — the parallelism of multi-head attention is a game changer.",
            time: "45m ago",
            replies: [
              {
                id: "c1r1r1",
                username: "ml_student",
                text: "So each head captures a different relationship? That's fascinating.",
                time: "30m ago",
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: "c2",
        username: "ml_student",
        text: "Finally understood why transformers beat RNNs. The parallelization aspect is key.",
        time: "45m ago",
        replies: [],
      },
    ],
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
      "🖼️ Diffusion models generate images by reversing a noise-adding process. Starting from pure Gaussian noise, the model gradually denoises step by step — like sculpting a statue from a block of marble.\n\nThe key insight: teach a model to predict the noise added at each step. Once trained, it can turn random noise into coherent images by subtracting predicted noise iteratively.\n\nStable Diffusion, DALL-E 3, and Midjourney all use variants of this approach. The math is elegant: it's all about estimating the score function of the data distribution.",
    initialComments: [
      {
        id: "c3",
        username: "art_ml",
        text: "The marble analogy really helps visualize the process. Love it!",
        time: "4h ago",
        replies: [],
      },
    ],
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
      "🎮 Reinforcement Learning teaches agents through trial and error. An agent takes actions in an environment, receives rewards or penalties, and learns a policy that maximizes cumulative reward over time.\n\nDeep RL combines neural networks with RL algorithms like PPO and SAC. This is how AlphaGo mastered Go and how robots learn to walk.\n\nThe exploration-exploitation dilemma is central: should the agent try something new or stick with what works? Solving this efficiently is what makes modern RL so powerful.",
    initialComments: [],
  },
];

export default POSTS;
