import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';

// ── Config ──────────────────────────────────────────────────────────

const ROOT_COUNT = 35;
const LV1_COUNT = 15;
const LV2_COUNT = 12;
const LV3_COUNT = 8;
const LV4_COUNT = 30;
const LV5_COUNT = 5;
const POST_IDS = [1, 2, 3];

// ── Users ───────────────────────────────────────────────────────────

const USERS = [
  { user_name: 'neural_fan', email: 'neural_fan@example.org', home_page: 'https://neural-fan.blog' },
  { user_name: 'diffusion_guy', email: 'diffusion_guy@example.org', home_page: 'https://diffusion-guy.dev' },
  { user_name: 'rl_agent', email: 'rl_agent@example.org', home_page: '' },
  { user_name: 'ml_wanderer', email: 'wanderer@example.org', home_page: 'https://ml-wanderer.io' },
  { user_name: 'tech_observer', email: 'observer@example.org', home_page: '' },
];

// ── Root texts per post (cycled to reach ROOT_COUNT) ────────────────

const AI_ROOTS = [
  'The attention mechanism really is the killer feature of transformers. Computing relevance scores between every pair of tokens is elegant.',
  'Great breakdown! The parallel processing is made possible by multi-head attention splitting computation across heads.',
  'Does the quadratic complexity of self-attention become a bottleneck for very long sequences in practice?',
  'I remember when RNNs were state of the art. The shift to transformers feels like going from bicycles to sports cars.',
  'The "attention is all you need" paper from 2017 is one of those rare papers that redefines an entire field overnight.',
  'What about KV-cache optimization at inference time? That is what makes transformer-based chat models so responsive.',
  'Different attention heads specialize in different linguistic features — syntax, semantics, coreference. Emergent specialization without explicit training.',
  'Is there a theoretical limit to how many parameters a transformer can have while remaining effective?',
  'The training cost for these models is staggering. Do you think we will see more efficient architectures emerge soon?',
  'I would love a detailed comparison between transformer-based and state-space models like Mamba on long-context tasks.',
  'Positional encodings are critical. Without them, self-attention would be permutation-invariant and order-blind.',
  'The depth of the network creates hierarchical representations — that is why GPT-4 can handle such complex reasoning tasks.',
  'How does cross-attention differ from self-attention in encoder-decoder architectures like the original Transformer?',
  'Transformers are highly parallelizable during training. Unlike RNNs, you can process all tokens simultaneously.',
  'I think the next leap will come from sparse attention patterns — reducing computation while keeping expressiveness.',
  'Flash Attention made training dramatically faster. Has anyone compared its memory savings at different sequence lengths?',
  'The scaling laws paper showed that performance improves smoothly with compute, data, and parameters. That was a huge insight.',
  'What happens when you train a transformer on code versus natural language? Do the attention patterns look different?',
  'The mixture-of-experts approach (like Mixtral) seems like a smart way to scale parameters without proportional compute costs.',
  'Has anyone successfully applied transformer architectures outside NLP — say, to time series or genomics?',
  'I find the concept of "attention heads specializing" fascinating — do they develop specific roles during training?',
  'The context window size keeps growing. Do techniques like RoPE scale indefinitely, or is there a practical upper bound?',
  'Quantization techniques like GPTQ and AWQ make running large transformers on consumer hardware possible.',
  'How important is weight initialization for training deep transformers from scratch?',
  'The emergence of in-context learning is still poorly understood theoretically. It seems like a form of meta-learning.',
  'I have been experimenting with <code>torch.compile</code> for transformer inference and the speedup is impressive.',
  'What is the current state of open-source multilingual models compared to GPT-4?',
  'The encode-decode bottleneck in the original transformer was addressed by the decoder-only architecture in GPT models.',
  'Do you think we will see transformers being replaced by something entirely new within the next five years?',
  'The role of layer normalization in transformers is often underappreciated. It stabilizes training significantly.',
  'How does temperature scaling affect the quality of generated text in practice?',
  'Retrieval-augmented generation (RAG) solves the knowledge cutoff problem without retraining the model.',
  'I am curious about the memory usage of <code>flash_attn</code> compared to standard attention at 100K+ context windows.',
  'The attention patterns in early layers capture surface-level features, while deeper layers capture abstract concepts.',
  'Speculative decoding is a clever trick to speed up inference without sacrificing output quality at all.',
];

const DIFFUSION_ROOTS = [
  'The reverse diffusion process is beautiful. Starting from noise and gradually removing it to reveal an image — like developing a photograph in reverse.',
  'Great explanation! The score function estimation is really the mathematical core. It is essentially learning the gradient of the log-density.',
  'How does inference speed compare between diffusion models and GANs? I heard diffusion is slower but more diverse.',
  'The connection between diffusion models and Langevin dynamics makes so much sense in hindsight.',
  'Classifier-free guidance is such a simple but effective trick. A small tweak that dramatically improves prompt adherence.',
  'What are the practical differences between DDPM and DDIM sampling? When would you choose one over the other?',
  'The latent space approach of Stable Diffusion is genius — you do diffusion in a compressed latent space instead of pixel space.',
  'Is there a theoretical upper bound on image quality from diffusion models, or can they eventually match photographs?',
  'Training diffusion models seems incredibly sensitive to hyperparameters like learning rate and noise schedule.',
  'The UNet architecture with skip connections preserves spatial information perfectly for the denoising task.',
  'Do you think video diffusion models will become practical for production use within the next year?',
  'The noise schedule is critical. Too much noise and the model cannot learn; too little and it overfits.',
  'Diffusion models naturally handle unconditional generation — you can generate without any prompt at all.',
  'Are there any open-source text-to-image models that rival Midjourney quality yet?',
  'The cross-attention layers in diffusion models are what connect text prompts to image features.',
  'How does guidance scale affect the diversity-quality tradeoff in practice?',
  'I have been using LoRA fine-tuning for custom styles and it works surprisingly well with minimal data.',
  'The CFG rescale trick helps avoid oversaturation at high guidance scales. A useful hack.',
  'What scheduling strategies work best for fast sampling? DPM++ seems to outperform DDIM in my tests.',
  'ControlNet opened up so many possibilities. Being able to guide generation with edge maps or poses is incredible.',
  'The resolution limitations in most diffusion models are frustrating. I hope cascaded models solve this.',
  'How do diffusion models handle text rendering in generated images? It is still a weak point.',
  'The adversarial diffusion distillation approach speeds up sampling dramatically. Is there any quality loss?',
  'I noticed that different random seeds produce very different compositions. Is there a way to control layout better?',
  'The role of the VAE decoder in latent diffusion is underappreciated. It converts the latent back to pixel space.',
  'Have you tried using prompt weighting syntax like <code>(keyword:1.3)</code>? It gives fine-grained control.',
  'What are the best practices for training a custom diffusion model on a small dataset?',
  'The cosine noise schedule proposed by improved DDPM seems more stable than the linear one.',
  'I think the future is in multi-modal diffusion models that handle text, image, and audio simultaneously.',
  'Attention-based upsampling in cascaded diffusion models produces much sharper results than simple interpolation.',
  'The inversion techniques (like Null-text Inversion) allow editing real images with diffusion models.',
  'How important is the text encoder (CLIP / T5) quality for overall image generation quality?',
  'Consistency models are an exciting direction — single-step generation while keeping diffusion quality.',
  'The latent space has topological properties that affect how interpolations between images look.',
  'Gaussian noise is standard, but has anyone experimented with other noise distributions for better results?',
];

const RL_ROOTS = [
  'The exploration-exploitation dilemma is what makes RL so fascinating. Too much exploration and the agent never converges.',
  'PPO is my favorite RL algorithm. It is stable, relatively simple to implement, and works across many environments.',
  'How well does RL transfer from simulation to the real world? The sim-to-real gap seems like the biggest challenge.',
  'The way AlphaGo combined Monte Carlo Tree Search with neural networks was a breakthrough moment for AI.',
  'Reward shaping makes or breaks RL agents. A poorly designed reward function leads to bizarre emergent behaviors.',
  'What are your thoughts on curiosity-driven exploration as a way to solve sparse reward problems?',
  'Deep RL is notoriously sample-inefficient. Do you think model-based approaches are the ultimate solution?',
  'The Bellman equation is at the heart of value-based methods. Remarkable that such a simple equation enables complex behavior.',
  'Multi-agent RL is fascinating — emergent cooperation and competition between agents is like artificial sociology.',
  'What environments do you recommend for learning RL beyond Gymnasium?',
  'The trade-off between off-policy and on-policy methods is subtle. Off-policy is more efficient but less stable.',
  'SAC is great for continuous control problems. The entropy regularization keeps the agent from converging too quickly.',
  'How important is the replay buffer size in DQN? I have seen conflicting advice across different papers.',
  'RL at scale — like in Dota 2 or StarCraft — requires such massive infrastructure. Impressive that it works at all.',
  'I think the future of RL is in hierarchical reinforcement learning — agents that learn to break tasks into sub-tasks.',
  'The reward hypothesis by Sutton suggests that all goals can be framed as reward maximization. Do you agree?',
  'What is the best way to handle partially observable environments in deep RL?',
  'Dreamer and other world-model approaches are closing the gap with model-free methods in terms of performance.',
  'How does the discount factor gamma affect the learned policy in practice?',
  'I have found that hyperparameter tuning matters more for RL than for supervised learning by a wide margin.',
  'The sample efficiency of offline RL is appealing for real-world applications where data collection is expensive.',
  'Have you tried using transformers as policy networks? Decision Transformer treats RL as a sequence modeling problem.',
  'The credit assignment problem is still not fully solved. Long action sequences with delayed rewards are hard.',
  'What are the practical differences between DDPG and TD3 for continuous control?',
  'Safety in RL is an under-explored area. Constrained MDPs and safe exploration are critical for real-world deployment.',
  'The use of data augmentation in RL (like RAD and DrQ) significantly improves sample efficiency on vision-based tasks.',
  'I think combining RL with imitation learning is the most practical path for robotics applications.',
  'How do you deal with distribution shift in offline RL when the learned policy encounters unseen states?',
  'The diversity of behaviors in unsupervised RL (like DIAYN) is an intriguing direction for skill discovery.',
  'What is the current state of research on meta-RL and few-shot adaptation?',
  'The gradient estimator in REINFORCE is unbiased but has high variance. Baselines help but are not a complete solution.',
  'Evolution strategies are a surprisingly competitive alternative to gradient-based RL for certain problems.',
  'How important is environment parallelization for training speed in modern RL frameworks?',
  'The idea of using learned world models for planning (like in MuZero) elegantly combines model-based and model-free approaches.',
  'I wonder if RL can be successfully applied to natural language tasks like dialogue optimization or reasoning chains.',
];

// ── Reply texts per depth ───────────────────────────────────────────

const LV1_TEXTS = [
  'That is an excellent point. I would add that the practical implementation often reveals nuances the theory does not capture.',
  'Has anyone here experimented with alternative approaches to this problem? I would love to hear about real-world results.',
  'This matches my experience exactly. The key is to iterate fast and measure everything.',
  'Interesting perspective! What about the computational trade-offs you mentioned? Do they change at different scales?',
  'I have been following this space for a while and I completely agree with your assessment.',
  'What sources would you recommend for diving deeper into this specific aspect?',
  'The field moves so fast — this post is a great summary of where things stand right now.',
  'One nuance that often gets missed: the implementation details matter as much as the algorithm itself.',
  'I tried something similar last month and found that careful hyperparameter tuning made a huge difference.',
  'This is exactly the kind of discussion that makes this community valuable. Thanks for sharing your perspective.',
  'Could you elaborate on the performance characteristics you observed? I am curious about the numbers.',
  'The trade-off between accuracy and efficiency is always tricky. Your approach seems well-balanced though.',
  'I think the research community is starting to converge on this view as well. Great to see it discussed here.',
  'Have you considered the impact of different hardware configurations? Some methods benefit more from GPU parallelism.',
  'This resonates with what I have seen in production systems. The simplicity of the approach is its real strength.',
  'The ablation studies on this topic are particularly revealing. Most improvements come from just a few key changes.',
  'I appreciate how you connected the theoretical foundation to practical considerations. That is often missing.',
  'What thresholds or criteria do you use to evaluate success? Real-world metrics are harder than academic benchmarks.',
  'I have been on the fence about this approach, but your explanation makes a compelling case for trying it.',
  'The community would benefit from more reproducible experiments in this area. Are you planning to open-source your code?',
];

const LV2_TEXTS = [
  'Completely agree. The practical insights from real deployments are invaluable.',
  'This is a good clarification. The distinction between theory and practice is often blurry.',
  'I had a similar experience. Consistency in the approach matters more than chasing the latest technique.',
  'Well put. The fundamentals are often overlooked in favor of novelty.',
  'This echoes what I have heard from practitioners at recent conferences.',
  'The numbers speak for themselves. Do you have benchmarks to share?',
  'I think the key insight here applies beyond just this specific use case.',
  'Right. The incremental improvements from tuning are often larger than switching algorithms entirely.',
  'That matches the benchmarks I have seen. The difference is smaller than people expect.',
  'A pragmatic take that more people should adopt. Perfection is the enemy of progress.',
  'This really depends on the scale of the problem though. Small-scale results do not always generalize.',
  'The reproducibility crisis in ML makes firsthand accounts like this especially valuable.',
  'I have been saying this for years. Simple baselines are surprisingly hard to beat.',
  'The devil is in the data quality. Garbage in, garbage out applies everywhere.',
  'Great point. The choice of evaluation metric can completely change the conclusion.',
  'I would be curious to see how this holds up with different random seeds and data splits.',
  'The compute budget is often the hidden variable that explains different results across papers.',
  'This aligns with the no-free-lunch theorem — every approach has its sweet spot.',
  'A well-structured experiment with proper ablations is worth more than a dozen incremental SOTA claims.',
  'The deployment constraints often dictate which approach is viable, regardless of research appeal.',
];

const LV3_TEXTS = [
  'Exactly. Could not agree more.',
  'This is the right way to think about it.',
  'Thanks for adding this detail. It is important context.',
  'I have observed the same pattern in my work.',
  'A necessary clarification that is often skipped.',
  'The data quality angle cannot be overstated.',
  'This applies broadly across the field.',
  'Consistency and reproducibility matter more than raw performance.',
  'The nuance here is exactly what people miss.',
  'Practical experience beats theoretical perfection every time.',
  'This is underappreciated advice.',
  'The straightforward approach is usually the best.',
  'These details are what separate production from demos.',
  'Context matters more than the algorithm choice.',
  'Simple and robust beats complex and fragile.',
  'This deserves more attention.',
  'An important reality check.',
  'The ecosystem around the tool matters too.',
  'Iterate quickly and measure honestly.',
  'Good engineering trumps clever algorithms most of the time.',
];

const LV4_TEXTS = [
  '+1',
  'This 100%.',
  'Strongly agree.',
  'Well said.',
  'Exactly right.',
  'Totally agree.',
  'Nail on the head.',
  'Great take.',
  'This ^',
  'Could not agree more.',
  'Facts.',
  'Preach.',
  'Hard agree.',
  'Truth.',
  'Big +1.',
  'This right here.',
  'Absolutely.',
  'Yes, this.',
  'Precisely.',
  'On point.',
  'Same experience here.',
  'Quoting for truth.',
  'Hear, hear!',
  'No notes.',
  'Worth repeating.',
  'Underrated comment.',
  'Spitting facts.',
  'Exactly my thought.',
  'You read my mind.',
  'Clear and correct.',
];

const LV5_TEXTS = [
  '👍',
  '💯',
  '🔥',
  '👆',
  'This.',
  'Agreed.',
  'Yep.',
  'Same.',
  'Word.',
  'QFT.',
];

// ── Helpers ──────────────────────────────────────────────────────────

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pick<T>(arr: T[]): T {
  return arr[randInt(arr.length)];
}

function randomUserEmail(): string {
  return USERS[randInt(USERS.length)].email;
}

function randomTimestamp(earliestHours: number, latestHours: number): Date {
  const now = Date.now();
  const offset = randInt((earliestHours - latestHours) * 3600000);
  return new Date(now - earliestHours * 3600000 + offset);
}

// ── Insert comments for one post ───────────────────────────────────

interface CommentNode {
  id: number;
  depth: number;
}

async function insertCommentsForPost(
  prisma: PrismaClient,
  postId: number,
  rootTexts: string[],
): Promise<void> {
  const comments: CommentNode[] = [];

  // Phase 1 — root comments (depth 0)
  for (let i = 0; i < ROOT_COUNT; i++) {
    const text = rootTexts[i % rootTexts.length];
    const result = await prisma.comment.create({
      data: {
        postId,
        text,
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(168, 24),
      },
    });
    comments.push({ id: result.id, depth: 0 });
  }
  console.log(`  Post ${postId}: ${ROOT_COUNT} root comments`);

  // Phase 2 — level 1 (depth 1)
  for (let i = 0; i < LV1_COUNT; i++) {
    const parent = pick(comments.filter((c) => c.depth === 0));
    const result = await prisma.comment.create({
      data: {
        postId,
        parentCommentId: parent.id,
        text: pick(LV1_TEXTS),
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(72, 6),
      },
    });
    comments.push({ id: result.id, depth: 1 });
  }
  console.log(`  Post ${postId}: ${LV1_COUNT} level-1 replies`);

  // Phase 3 — level 2 (depth 2)
  for (let i = 0; i < LV2_COUNT; i++) {
    const parent = pick(comments.filter((c) => c.depth === 1));
    const result = await prisma.comment.create({
      data: {
        postId,
        parentCommentId: parent.id,
        text: pick(LV2_TEXTS),
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(48, 4),
      },
    });
    comments.push({ id: result.id, depth: 2 });
  }
  console.log(`  Post ${postId}: ${LV2_COUNT} level-2 replies`);

  // Phase 4 — level 3 (depth 3)
  for (let i = 0; i < LV3_COUNT; i++) {
    const parent = pick(comments.filter((c) => c.depth === 2));
    const result = await prisma.comment.create({
      data: {
        postId,
        parentCommentId: parent.id,
        text: pick(LV3_TEXTS),
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(36, 2),
      },
    });
    comments.push({ id: result.id, depth: 3 });
  }
  console.log(`  Post ${postId}: ${LV3_COUNT} level-3 replies`);

  // Phase 5 — level 4 (depth 4)
  for (let i = 0; i < LV4_COUNT; i++) {
    const parent = pick(comments.filter((c) => c.depth === 3));
    const result = await prisma.comment.create({
      data: {
        postId,
        parentCommentId: parent.id,
        text: pick(LV4_TEXTS),
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(24, 1),
      },
    });
    comments.push({ id: result.id, depth: 4 });
  }
  console.log(`  Post ${postId}: ${LV4_COUNT} level-4 replies`);

  // Phase 6 — level 5+ (depth 5, edge case)
  for (let i = 0; i < LV5_COUNT; i++) {
    const parent = pick(comments.filter((c) => c.depth === 4));
    const result = await prisma.comment.create({
      data: {
        postId,
        parentCommentId: parent.id,
        text: pick(LV5_TEXTS),
        userEmail: randomUserEmail(),
        createdAt: randomTimestamp(6, 0),
      },
    });
    comments.push({ id: result.id, depth: 5 });
  }
  console.log(`  Post ${postId}: ${LV5_COUNT} level-5+ edge-case replies`);

  const total = comments.length;
  console.log(`  → Post ${postId} total: ${total} comments`);
}

// ── Main ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const shouldClear = process.argv.includes('--clear');

  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  });

  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  if (shouldClear) {
    await prisma.file.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.user.deleteMany();
    console.log('Existing data cleared');
  }

  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        userName: u.user_name,
        email: u.email,
        homePage: u.home_page || null,
      },
      update: {},
    });
  }
  console.log(`Upserted ${USERS.length} users`);

  const postTexts: Record<number, string[]> = {
    1: AI_ROOTS,
    2: DIFFUSION_ROOTS,
    3: RL_ROOTS,
  };

  for (const postId of POST_IDS) {
    console.log(`\nPost ${postId} — inserting comments...`);
    await insertCommentsForPost(prisma, postId, postTexts[postId]);
  }

  await prisma.$disconnect();
  console.log('\nSeed complete');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
