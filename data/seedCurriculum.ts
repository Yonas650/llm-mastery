import { lifecycleTopics } from "@/data/lifecycleCurriculum";
import type { TopicModule } from "@/types";

const llmPretraining: TopicModule = {
  slug: "llm-pretraining",
  sequence: 1,
  title: "LLM Pretraining",
  estimatedMinutes: 90,
  summary:
    "Train a base model to model token distributions over massive text mixtures before any instruction behavior, preference optimization, retrieval, or tool use is added.",
  masteryPath: [
    "Define the causal next-token objective precisely.",
    "Connect cross-entropy, negative log likelihood, and perplexity.",
    "Explain what information enters through data mixtures and tokenization.",
    "Trace one optimizer step from tokens to checkpoint write.",
    "Separate pretraining capability from post-training behavior."
  ],
  overview: [
    "Pretraining is the stage where a randomly initialized or partially initialized model is optimized to predict the next token over a very large corpus. The output is a base model: a distribution over continuations, not a chat assistant. It has absorbed statistical structure from code, prose, math, tables, markup, dialogue fragments, and other sources, but it has not yet been shaped to follow user instructions reliably.",
    "The central training signal is simple: given tokens x₁ through xₜ, assign high probability to xₜ₊₁. Repeating that objective across trillions of positions forces the network to compress syntax, facts, styles, algorithms, latent task structure, and long-range dependencies into parameters. The strength of the objective is not that it explicitly labels skills. The strength is that many skills are useful predictors of future text.",
    "A pretrained model learns conditional distributions, not truth. If the data distribution says a false claim is common in a context, the model can assign it high probability. If a rare but important reasoning trace is underrepresented, the base model may not prefer it. This is why pretraining creates broad capability but not aligned interaction behavior.",
    "The implementation surface is a streaming data pipeline, a tokenizer, sequence packing, causal masking, forward pass, token-level loss, backward pass, optimizer update, learning-rate schedule, checkpointing, and evaluation. At scale, the systems problem is as important as the mathematical objective: keeping accelerators fed, synchronizing gradients, recovering from failures, and measuring progress without overfitting to the wrong evals.",
    "The main levers are model size, token budget, data quality, data mixture, context length, batch size, optimizer settings, precision, parallelism strategy, and checkpoint cadence. These levers trade off compute efficiency, final loss, downstream capability, stability, and cost.",
    "Pretraining differs from SFT, instruction tuning, RLHF, DPO, and RAG by where the supervision enters. Pretraining predicts raw next tokens from broad data. SFT imitates curated responses. Preference optimization changes relative preference between candidate answers. RAG changes the input context at inference time. None of those later stages can fully replace missing pretraining coverage."
  ],
  deepLesson: [
    "What pretraining is: optimize pθ(xₜ | x<t) over a corpus. The model sees token sequences and updates parameters so the observed next token receives higher probability. Every position in a packed sequence contributes a supervised example, even though no human wrote an explicit label for that position.",
    "What the model actually learns: a compressed, parameterized approximation of the training distribution. It learns local syntax because syntax predicts tokens. It learns factual associations because entities co-occur in predictable contexts. It learns code patterns because compilable code has strong sequential constraints. It learns some reasoning procedures because intermediate reasoning text often has structured continuation patterns.",
    "Why next-token prediction is powerful: many tasks can be represented as text continuation. Translation is continuation after a bilingual prompt. Summarization is continuation after a document and instruction-like prefix. Code completion is continuation under programming-language constraints. Mathematical derivation is continuation of symbolic state. The objective is generic, but the distribution contains many task formats.",
    "Causal language modeling objective: the model cannot attend to future tokens. It receives a prefix and produces a probability vector over the vocabulary for each position. Training shifts labels by one position, compares logits at t against token xₜ₊₁, and averages the negative log probability of the correct next token across non-padding positions.",
    "Cross-entropy loss: for one token, loss is −log pθ(correct token | context). If the model assigns probability 0.5 to the correct token, loss is about 0.693 nats. If it assigns 0.01, loss is about 4.605 nats. A small average loss improvement over billions of tokens can represent a large capability gain because it means probability mass moved toward many correct continuations.",
    "Perplexity: exp(mean cross-entropy). It is the effective branching factor under the model. A perplexity of 20 means the model behaves as if roughly 20 equally likely next tokens remain on average. Perplexity is useful for tracking distribution modeling, but lower perplexity on a corpus does not automatically mean safer, more truthful, or more helpful responses.",
    "Dataset mixtures: pretraining quality is dominated by what distribution the model sees. A mixture may contain filtered web, books, papers, code, math, multilingual data, synthetic data, and domain corpora. The mixture weights decide which skills receive gradient budget. Overweighting low-quality or duplicated text can waste compute and increase memorization.",
    "Tokenization: the tokenizer maps bytes or text into discrete IDs. It controls sequence length, rare-word fragmentation, code indentation representation, multilingual efficiency, and exact string behavior. Tokenization is not a side detail. A poor tokenizer increases effective context cost and can make some domains harder to model.",
    "Training loop: load packed token batches, run a forward pass, compute causal LM loss, backpropagate gradients, optionally accumulate gradients across microbatches, synchronize gradients across devices, apply optimizer update, advance schedule, log metrics, and periodically save checkpoints. At scale, almost every line of this loop has performance and stability implications.",
    "Optimizer intuition: gradient descent changes parameters in the direction that lowers average loss on the sampled batch. Adam-style optimizers normalize updates using first and second moment estimates, which helps with noisy high-dimensional gradients. Learning-rate warmup avoids unstable early jumps; decay reduces update size as the model approaches a better basin.",
    "Batch size and gradient accumulation: the global batch is microbatch size times accumulation steps times data-parallel workers. Larger batches give lower-gradient noise and better hardware utilization, but too-large batches can reduce generalization or require learning-rate changes. Gradient accumulation simulates a larger batch when memory cannot hold it at once.",
    "Checkpointing: pretraining runs are long enough that failure is expected. Checkpoints store model weights, optimizer state, scheduler state, tokenizer/config metadata, random states, and sometimes dataloader position. A checkpoint that cannot resume the exact training state is incomplete for serious pretraining.",
    "Evaluation during pretraining: holdout loss tracks whether the model is improving on data not used for updates. Domain evals reveal mixture-specific behavior: code, math, multilingual, long-context, factual recall, and contamination-sensitive benchmarks. Good pretraining evals are diagnostic; they do not turn the base model into an assistant.",
    "Scaling laws intuition: loss tends to improve predictably with more parameters, data, and compute, but the best allocation depends on the compute budget. Too many parameters with too little data undertrains the model. Too much data with too small a model may hit capacity limits. The useful question is not only 'bigger model?' but 'which bottleneck is active?'",
    "Compute/data/model-size tradeoff: increasing context length raises attention and KV memory costs. Increasing tokens raises training time. Increasing model size raises FLOPs per token and optimizer memory. Data quality can shift the curve because high-signal tokens are worth more than repeated boilerplate.",
    "What pretraining does not do: it does not guarantee instruction following, calibrated truthfulness, refusal behavior, tool use, source grounding, or stable chain-of-thought style. Those are shaped later by supervised data, preference data, inference-time scaffolding, retrieval, system prompts, tools, and product constraints.",
    "How it differs from SFT, instruction tuning, RLHF, and RAG: SFT teaches response format by imitation. Instruction tuning broadens command-following behavior. RLHF and DPO optimize preferences between outputs. GRPO-style methods can reinforce reasoning behaviors from reward signals. RAG injects external evidence at inference. Pretraining is the broad distributional substrate underneath all of them."
  ],
  mathCore: [
    {
      title: "Next-token probability",
      formula: "p_\\theta(x_{1:T}) = \\prod_{t=1}^{T} p_\\theta(x_t \\mid x_{<t})",
      explanation:
        "A causal LM factors the sequence probability into next-token conditionals. Training improves these conditionals across every non-padding token position."
    },
    {
      title: "Negative log likelihood",
      formula: "\\mathrm{NLL}(x_{1:T}) = -\\sum_{t=1}^{T} \\log p_\\theta(x_t \\mid x_{<t})",
      explanation:
        "High probability on the observed token reduces loss. Assigning tiny probability to the observed token creates a large penalty."
    },
    {
      title: "Token-averaged cross-entropy",
      formula:
        "\\mathcal{L} = -\\frac{1}{N}\\sum_{i=1}^{B}\\sum_{t=1}^{T_i}\\log \\operatorname{softmax}(z_{i,t})_{x_{i,t+1}}",
      explanation:
        "The practical loss averages only valid prediction positions. Padding, ignored labels, or packed-boundary masks should not contribute."
    },
    {
      title: "Perplexity",
      formula: "\\mathrm{PPL} = \\exp(\\mathcal{L})",
      explanation:
        "Perplexity converts average nats of cross-entropy into an effective branching factor. It is distribution modeling quality, not direct product quality."
    },
    {
      title: "Gradient descent intuition",
      formula: "\\theta_{k+1} = \\theta_k - \\eta\\,\\nabla_\\theta \\mathcal{L}(\\theta_k)",
      explanation:
        "The optimizer nudges parameters against the loss gradient. Adam modifies this update with moving averages so noisy coordinates do not dominate."
    }
  ],
  figures: ["tokenPrediction", "lossCurve", "trainingStep", "pipeline"],
  implementationNotes: [
    "Tokenize once or stream-tokenize deterministically, then pack documents into fixed-length blocks while preventing accidental labels across boundaries when needed.",
    "Use label shifting rather than constructing separate input and target tensors by hand in every batch. The common pattern is input_ids[:, :-1] predicting labels[:, 1:].",
    "Mask padding and any artificial packed separators with ignore_index so loss averages over real token predictions only.",
    "Track global batch exactly: microbatch size * gradient accumulation steps * data parallel replicas. Incorrect accounting corrupts learning-rate and token-throughput comparisons.",
    "Persist tokenizer version, context length, model config, optimizer state, scheduler state, and training step in checkpoints. A weights-only checkpoint is not enough for resume.",
    "Log train loss, validation loss, tokens/sec, learning rate, gradient norm, skipped steps, memory, and data loader lag. Loss without systems counters is hard to debug.",
    "Use mixed precision carefully. bf16 is usually more forgiving than fp16 for large models, but optimizer state and reductions still need numerical attention.",
    "Evaluate on fixed heldout sets and rotating diagnostic sets. If validation data changes silently, loss curves stop being comparable."
  ],
  systemsNotes: [
    "Pretraining throughput is often limited by input pipeline, communication, memory bandwidth, or attention cost, not only raw matrix multiplication.",
    "Data parallelism replicates the model and synchronizes gradients. Tensor parallelism shards matrix operations. Pipeline parallelism splits layers. FSDP/ZeRO shards parameters, gradients, and optimizer state.",
    "Sequence length increases activation memory and attention work. Doubling context can more than double cost depending on attention implementation and checkpointing strategy.",
    "Gradient checkpointing trades extra compute for lower activation memory by recomputing intermediate activations during backward pass.",
    "Checkpoint cadence balances recovery risk against storage and pause overhead. Large optimizer checkpoints can be many times larger than model weights.",
    "Stable training depends on learning-rate schedule, initialization, normalization, gradient clipping, precision, and bad-batch handling.",
    "Data deduplication matters because repeated sequences lower loss cheaply while increasing memorization and benchmark contamination risk.",
    "A real run needs observability: token counters, hardware utilization, network stalls, validation regressions, NaN detection, and restart drills."
  ],
  failureModes: [
    {
      name: "Training loss improves but validation loss stalls",
      symptom: "The model fits sampled batches while heldout loss barely moves.",
      diagnosis: "Data duplication, contamination, distribution mismatch, or an optimizer schedule that is no longer effective.",
      mitigation: "Audit deduplication, split construction, mixture weights, learning-rate schedule, and heldout representativeness."
    },
    {
      name: "Sudden loss spike",
      symptom: "Loss or gradient norm jumps sharply, sometimes followed by NaNs.",
      diagnosis: "Unstable learning rate, bad batch, precision overflow, optimizer state corruption, or distributed synchronization fault.",
      mitigation: "Inspect recent batches, enable gradient clipping, lower LR, check loss scale/bf16 path, and resume from a clean checkpoint."
    },
    {
      name: "High memorization",
      symptom: "The model reproduces long spans from training data or benchmark answers.",
      diagnosis: "Duplicated data, small unique token budget, weak filtering, or repeated benchmark-like examples.",
      mitigation: "Deduplicate aggressively, remove benchmark contamination, adjust mixture weights, and measure exact and near-duplicate overlap."
    },
    {
      name: "Tokenizer inefficiency",
      symptom: "Certain domains consume many more tokens than expected.",
      diagnosis: "Tokenizer fragments code, math, multilingual text, or domain notation poorly.",
      mitigation: "Measure tokens per character by domain, revise tokenizer training data, or budget mixture/context length accordingly."
    },
    {
      name: "Undertrained large model",
      symptom: "A large model is expensive but not much better than a smaller one.",
      diagnosis: "The parameter count was increased without enough high-quality token budget.",
      mitigation: "Rebalance compute toward more tokens, smaller model size, or higher-quality data."
    },
    {
      name: "Hardware utilization collapse",
      symptom: "Tokens/sec drops while loss behavior looks normal.",
      diagnosis: "Dataloader stalls, checkpoint pause, straggler node, communication bottleneck, or memory fragmentation.",
      mitigation: "Profile pipeline stages, shard data properly, prefetch, inspect network counters, and tune checkpoint cadence."
    },
    {
      name: "Misleading benchmark gains",
      symptom: "A benchmark improves but related heldout tasks do not.",
      diagnosis: "Contamination, benchmark overfitting, or narrow mixture artifact.",
      mitigation: "Run contamination checks, use private evals, compare related domains, and inspect examples manually."
    },
    {
      name: "Base model behaves unlike an assistant",
      symptom: "The model continues text, imitates unsafe formats, or ignores direct commands.",
      diagnosis: "This is expected. Pretraining did not optimize instruction-following preferences.",
      mitigation: "Use SFT, instruction tuning, preference optimization, safety training, and product-level guardrails."
    }
  ],
  activeRecall: [
    {
      id: "pretraining-recall-1",
      prompt: "State the causal LM objective without using vague phrases like 'learn language'.",
      answer:
        "Maximize the likelihood of each observed next token under pθ(xₜ | x<t), or equivalently minimize token-averaged negative log likelihood."
    },
    {
      id: "pretraining-recall-2",
      prompt: "Why can next-token prediction teach capabilities that were never explicitly labeled?",
      answer:
        "Because many capabilities reduce uncertainty about future text. Syntax, facts, algorithms, and reasoning traces help assign probability to observed continuations."
    },
    {
      id: "pretraining-recall-3",
      prompt: "What is the difference between cross-entropy loss and perplexity?",
      answer:
        "Cross-entropy is average negative log probability of correct tokens. Perplexity is exp(cross-entropy), an effective branching factor."
    },
    {
      id: "pretraining-recall-4",
      prompt: "What must be masked out of token-level loss?",
      answer:
        "Padding, ignored labels, and any artificial positions where prediction would cross invalid packed-document boundaries."
    },
    {
      id: "pretraining-recall-5",
      prompt: "Why is a base model not automatically a helpful assistant?",
      answer:
        "Pretraining models raw continuation likelihood, not instruction compliance, preference alignment, safety policy, tool use, or grounded response behavior."
    },
    {
      id: "pretraining-recall-6",
      prompt: "How does gradient accumulation change the effective global batch?",
      answer:
        "Global batch equals microbatch size times accumulation steps times data-parallel replicas. Gradients are accumulated before one optimizer update."
    },
    {
      id: "pretraining-recall-7",
      prompt: "Name two reasons validation loss can be misleading during pretraining.",
      answer:
        "The validation split may be contaminated or distribution-mismatched, and aggregate loss can hide domain regressions."
    },
    {
      id: "pretraining-recall-8",
      prompt: "Why does data mixture weighting matter?",
      answer:
        "Mixture weights allocate gradient budget across domains, controlling which behaviors become cheap for the model to predict."
    },
    {
      id: "pretraining-recall-9",
      prompt: "What is saved in a complete training checkpoint beyond model weights?",
      answer:
        "Optimizer state, scheduler state, config, tokenizer metadata, step counters, random states, and often dataloader position."
    },
    {
      id: "pretraining-recall-10",
      prompt: "What does scaling-law intuition tell you to check before increasing model size?",
      answer:
        "Whether compute, data, or model capacity is the active bottleneck. Bigger models can be undertrained if token budget is insufficient."
    },
    {
      id: "pretraining-recall-11",
      prompt: "How is RAG different from pretraining?",
      answer:
        "RAG injects external retrieved context at inference time. Pretraining changes parameters by optimizing next-token likelihood over training data."
    },
    {
      id: "pretraining-recall-12",
      prompt: "Why can a tiny loss improvement matter?",
      answer:
        "It is averaged over many tokens. A small mean change can reflect probability mass moving correctly across a huge number of contexts."
    }
  ],
  practiceDrills: [
    {
      id: "pretraining-drill-ce",
      title: "Compute token cross-entropy",
      prompt:
        "A model assigns probabilities [0.70, 0.20, 0.10] to tokens [A, B, C]. The correct next token is B. Compute the token loss in nats.",
      expected: "-log(0.20) = 1.609 nats."
    },
    {
      id: "pretraining-drill-ppl",
      title: "Convert loss to perplexity",
      prompt: "Validation cross-entropy is 2.3 nats/token. Estimate perplexity.",
      expected: "exp(2.3) is about 9.97, so perplexity is about 10."
    },
    {
      id: "pretraining-drill-batch",
      title: "Estimate global tokens per step",
      prompt:
        "Sequence length is 4096, microbatch is 2 per GPU, there are 64 GPUs, and gradient accumulation is 8. How many tokens per optimizer step?",
      expected: "4096 * 2 * 64 * 8 = 4,194,304 tokens per optimizer step."
    },
    {
      id: "pretraining-drill-mask",
      title: "Find an invalid label position",
      prompt:
        "Two documents are packed as [docA tokens, EOS, docB tokens]. Should the token before docB's first token predict docB's first token?",
      expected:
        "Usually no if documents are meant to be independent. Mask that boundary or include a deliberate separator policy."
    },
    {
      id: "pretraining-drill-mixture",
      title: "Diagnose a mixture issue",
      prompt:
        "A base model improves web-text loss but code evals regress. Name two likely causes and one corrective experiment.",
      expected:
        "Code mixture weight may be too low, code quality/filtering may have changed, or tokenization may hurt code. Run a controlled mixture-weight ablation."
    },
    {
      id: "pretraining-drill-checkpoint",
      title: "Checkpoint completeness",
      prompt:
        "A run resumes from weights only after 300B tokens. What behavior might change compared with a full checkpoint resume?",
      expected:
        "Optimizer moments, scheduler phase, random state, and dataloader position may differ, causing a different training trajectory."
    },
    {
      id: "pretraining-drill-scale",
      title: "Compute tradeoff",
      prompt:
        "You can double parameters or double high-quality tokens but not both. What evidence would you inspect before deciding?",
      expected:
        "Compare undertraining signs, validation loss slope, domain evals, data exhaustion/duplication, and compute-optimal allocation estimates."
    },
    {
      id: "pretraining-drill-boundary",
      title: "Separate lifecycle stages",
      prompt:
        "A model gives fluent continuations but ignores 'Answer in JSON only.' Which stage is most directly missing?",
      expected:
        "Instruction tuning/SFT behavior is missing. Pretraining alone did not teach reliable command following."
    }
  ],
  memoryHooks: [
    "Pretraining buys continuation competence, not assistant behavior.",
    "Cross-entropy is surprise per token; perplexity is surprise converted into branching factor.",
    "The data mixture is the curriculum, even when nobody calls it one.",
    "A checkpoint is a recoverable training state, not just weights.",
    "Scaling is a three-way allocation problem: parameters, tokens, and compute."
  ],
  checklist: [
    "I can write the causal LM objective from memory.",
    "I can compute cross-entropy and perplexity for a simple example.",
    "I can explain why next-token prediction creates broad capability.",
    "I can trace the training loop from token batch to optimizer update.",
    "I can calculate global batch tokens with gradient accumulation.",
    "I can explain why tokenizer and mixture choices affect final behavior.",
    "I can identify at least five pretraining failure modes.",
    "I can describe what belongs in a complete checkpoint.",
    "I can interpret a validation loss curve without overclaiming product quality.",
    "I can distinguish pretraining from SFT, RLHF, DPO, GRPO, RAG, and inference-time tooling."
  ],
  isSeed: true
};

export const seedCurriculum: TopicModule[] = [
  llmPretraining,
  ...lifecycleTopics
];

export function getSeedTopic(slug: string): TopicModule | undefined {
  return seedCurriculum.find((topic) => topic.slug === slug);
}
