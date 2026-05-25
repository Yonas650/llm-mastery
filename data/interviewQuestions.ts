import type { InterviewQuestion, TopicModule } from "@/types";

type InterviewQuestionSeed = Omit<InterviewQuestion, "id">;

function q(
  difficulty: InterviewQuestion["difficulty"],
  tags: string[],
  question: string,
  answer: string
): InterviewQuestionSeed {
  return { difficulty, tags, question, answer };
}

export const interviewQuestionBank: Record<string, InterviewQuestionSeed[]> = {
  "llm-pretraining": [
    q(
      "core",
      ["objective", "base model"],
      "Explain LLM pretraining to an interviewer without saying only 'predict the next token'. What does the model learn and what does it not learn?",
      "A strong answer starts with the objective but does not stop there. Pretraining optimizes token-averaged likelihood over a broad corpus, so the model learns a compressed conditional distribution over text. That distribution contains syntax, facts, code patterns, reasoning traces, styles, document formats, and correlations between tasks and answers.\nThe important boundary is that pretraining creates a base model, not a reliable assistant. It does not directly optimize instruction following, truthfulness, refusal behavior, tool use, citation faithfulness, or product policy. Those are shaped by SFT, instruction tuning, preference optimization, RAG, guardrails, and serving-time control."
    ),
    q(
      "math",
      ["loss", "perplexity"],
      "Derive the causal language modeling loss for a batch and explain exactly what is averaged.",
      "For each sequence, logits at position t are compared with token t+1. The loss is the negative log probability assigned to the observed next token, usually after softmax over the vocabulary. For a batch, sum the loss only over valid prediction positions and divide by the number of valid tokens, not by raw batch size.\nPadding, ignored labels, and invalid packed-document boundaries must be excluded from both numerator and denominator. If the denominator is wrong, loss comparisons across batches or runs become misleading."
    ),
    q(
      "systems",
      ["training loop", "checkpointing"],
      "Walk through one optimizer step in a serious pretraining run, including the systems pieces that can break.",
      "The batch is read from sharded data, token IDs are packed into fixed-length blocks, labels are shifted, and a causal mask prevents future-token leakage. The model runs forward, computes token-level cross-entropy, backpropagates gradients, possibly accumulates microbatches, synchronizes gradients across replicas, clips or checks gradients, applies the optimizer and scheduler, logs metrics, and periodically checkpoints.\nSystems failure points include dataloader stalls, wrong global batch accounting, NaNs from precision or bad batches, communication bottlenecks, incomplete checkpoint state, and validation sets that are contaminated or silently changed."
    ),
    q(
      "debugging",
      ["data", "validation"],
      "Training loss improves but validation loss stalls. Give a structured diagnosis.",
      "Start by separating optimization from data. Check whether train/validation distributions match, whether the validation split is contaminated or too small, whether duplicated training data is lowering train loss cheaply, and whether a data-mixture change made validation less representative.\nThen inspect training dynamics: learning-rate schedule, batch size, gradient norm, skipped steps, precision overflows, and resume events. A good answer also asks for slice-level validation losses because aggregate loss can hide domain-specific regression."
    ),
    q(
      "design",
      ["scaling", "tradeoff"],
      "You have fixed compute. Should you increase model size or train on more tokens?",
      "The interview-grade answer is: do not decide from intuition alone. Inspect compute-matched scaling runs, validation loss slope near the end of training, domain losses, data uniqueness, deduplication, and whether the current model is capacity-limited or token-limited.\nIf loss is still improving steeply and the model is undertrained, more high-quality tokens may be better. If smaller models saturate and larger models show better loss at equal token budget, more parameters may help. If data quality is weak, neither raw scale choice fixes the bottleneck."
    )
  ],
  "tokenization-and-data-mixtures": [
    q(
      "core",
      ["tokenizer", "data"],
      "Why can tokenization choice materially affect LLM quality, even if the architecture and token budget stay fixed?",
      "Tokenization determines how raw text becomes prediction positions. A tokenizer that fragments code, math notation, multilingual text, IDs, or whitespace makes those domains consume more context and creates longer dependency chains for the same visible content.\nIt can also change exact-string behavior. If rare identifiers split into many unstable pieces, the model needs more examples to learn them. Interviewers want to hear that tokenization affects effective context length, compute allocation, domain fairness, and downstream behavior, not just preprocessing convenience."
    ),
    q(
      "math",
      ["mixture weights", "sampling"],
      "How do data mixture weights translate into training signal?",
      "If a domain is sampled with probability p(d), then roughly that fraction of token-level gradients comes from that domain, after accounting for sequence lengths and filtering. Mixture weights are therefore gradient-budget allocation.\nA good answer notes that document-level sampling and token-level share can differ. Short documents, high token-per-byte domains, deduplication, and packing policy all change the realized token distribution. You should measure actual tokens seen, not only configured weights."
    ),
    q(
      "debugging",
      ["deduplication", "contamination"],
      "A new data mixture lowers validation loss but benchmark behavior looks suspiciously high. What do you check?",
      "Check contamination first: exact and near-duplicate overlap between training data and benchmarks, prompt/answer leakage, and benchmark-like synthetic examples. Then inspect whether validation data was deduplicated after the train split, which can leak repeated text.\nA strong answer also asks for heldout private evals and domain-sliced loss. Lower loss is not automatically capability improvement when the mixture contains duplicated or benchmark-adjacent data."
    ),
    q(
      "systems",
      ["pipeline", "throughput"],
      "What data-pipeline metrics would you want before launching a large pretraining run?",
      "Track tokens per domain, token-per-byte, dedup rate, document counts, language distribution, filter drop rates, shard sizes, packing efficiency, dataloader wait time, and actual sampled mixture over time.\nThis is not optional observability. If code quality regresses or throughput drops, these counters tell you whether the cause is tokenizer inefficiency, bad sharding, mixture dilution, filtering changes, or input pipeline starvation."
    ),
    q(
      "design",
      ["tradeoff", "curriculum"],
      "How would you choose mixture weights for code, math, web, books, and multilingual data?",
      "Start from target capabilities and available high-quality unique data. Estimate token budget per domain, data quality, duplication, tokenizer efficiency, and marginal validation gains from ablations. Use small runs to measure domain loss and downstream eval sensitivity.\nThe best answer rejects one universal mixture. A coding model, multilingual assistant, and enterprise RAG generator should not allocate gradient budget identically. Mixture weights are a product and capability decision constrained by data quality."
    )
  ],
  "causal-language-modeling-objective": [
    q(
      "core",
      ["objective", "teacher forcing"],
      "What is teacher forcing in causal LM training, and why does it matter?",
      "Teacher forcing means the model conditions on the true previous tokens from the dataset while predicting the next token. It lets all positions in a sequence be trained in parallel because the model does not have to sample its own prefix one token at a time.\nThe tradeoff is train-inference mismatch. During inference, once the model generates tokens, later predictions condition on its own outputs. Exposure to gold prefixes makes training efficient but does not teach recovery from every self-generated mistake."
    ),
    q(
      "math",
      ["masking", "loss"],
      "Given a packed sequence, how do you decide which logits contribute to causal LM loss?",
      "A logit contributes only when it has a valid next-token label and the model was allowed to condition only on legal prefix tokens. Padding positions are ignored. Final positions with no next token are ignored. Packed-document boundaries may be ignored if documents are intended to be independent.\nA strong answer describes inspecting input_ids, shifted labels, attention mask, and loss mask on a tiny batch. Many real bugs are off-by-one label shifts or boundary leakage."
    ),
    q(
      "debugging",
      ["mask bug", "leakage"],
      "Your validation loss is unrealistically low but generations are poor. What objective bug is likely?",
      "Future-token leakage is the first suspect. If the causal mask is wrong, the model can see the answer token when producing logits, creating a low loss that does not translate to autoregressive generation.\nOther suspects are label leakage through packed boundaries, incorrect label shift, or evaluating with teacher-forced settings that do not match generation. The fix is to run a tiny deterministic example where the legal attention pattern and labels are manually known."
    ),
    q(
      "systems",
      ["implementation", "denominator"],
      "Why is loss denominator accounting important in causal LM training?",
      "The denominator should be the number of valid prediction tokens. If you divide by batch size, sequence length including padding, or microbatch count, the loss changes with padding ratio and packing efficiency.\nThis breaks comparison across batches and can corrupt gradient scale. In distributed training, every worker should contribute both summed loss and valid-token count so the global average is correct."
    ),
    q(
      "design",
      ["objective limits"],
      "Why does optimizing next-token likelihood not guarantee truthfulness?",
      "The objective rewards assigning high probability to observed continuations. If the training distribution contains false claims, outdated facts, fiction, or confident but wrong explanations, likelihood training can model those patterns.\nTruthfulness requires data curation, instruction tuning, preference signals, retrieval, calibration evals, and product guardrails. Next-token likelihood is a powerful compression objective, not a truth objective."
    )
  ],
  "loss-perplexity-and-scaling": [
    q(
      "math",
      ["perplexity", "cross-entropy"],
      "If validation cross-entropy drops from 2.30 to 2.20 nats/token, how should you interpret it?",
      "Perplexity moves from exp(2.30) about 10.0 to exp(2.20) about 9.0. The model is assigning about exp(0.10), or 1.105x, more probability to the observed next tokens on average.\nA strong answer says this can matter a lot over billions of tokens, but it still measures distribution modeling on that validation set. It is not direct proof of better instruction following, safety, or grounded answering."
    ),
    q(
      "core",
      ["metrics", "comparability"],
      "When is perplexity not comparable across two models?",
      "Perplexity is not cleanly comparable when tokenizers differ, validation sets differ, preprocessing differs, or loss masks differ. Tokenization changes the number and difficulty of prediction units.\nIt is most meaningful when computed on the same text, with the same tokenization convention or with careful normalization, and with identical masking rules. Interviewers want to hear skepticism about leaderboard-style perplexity comparisons."
    ),
    q(
      "debugging",
      ["loss curve", "regression"],
      "A global validation loss improves, but code evals regress. How do you explain this?",
      "The global validation set may be dominated by domains that improved while code became worse. Aggregate loss hides slice regressions.\nDiagnose by segmenting validation loss by domain, checking code mixture weight, tokenizer efficiency for code, contamination, and changes in code filtering. A high-quality answer emphasizes that model selection should gate on critical slices, not only global loss."
    ),
    q(
      "design",
      ["scaling laws", "compute"],
      "What do scaling laws help you decide, and what do they not decide?",
      "Scaling laws help allocate compute among parameter count, token count, and sometimes data quality or mixture. They let you estimate whether a larger model, more data, or more compute is likely to lower loss efficiently.\nThey do not decide product behavior, safety, instruction following, or whether your validation distribution matches deployment. They are planning tools, not substitutes for downstream evals."
    ),
    q(
      "systems",
      ["evaluation", "logging"],
      "What annotations should be attached to a loss curve in a real training dashboard?",
      "Annotate learning-rate schedule changes, global batch changes, data-mixture changes, checkpoint resumes, precision changes, skipped steps, validation-set version, and throughput changes.\nWithout those annotations, a loss kink can be misread as a modeling effect when it came from infrastructure, data, or optimizer state."
    )
  ],
  "distributed-training-basics": [
    q(
      "core",
      ["parallelism"],
      "Compare data parallelism, tensor parallelism, pipeline parallelism, and FSDP/ZeRO in one answer.",
      "Data parallelism replicates the model and averages gradients across workers. Tensor parallelism shards matrix operations within layers. Pipeline parallelism places different layers on different devices and sends activations between stages. FSDP/ZeRO shards parameters, gradients, and optimizer states to reduce memory.\nA strong answer mentions the tradeoff: every strategy reduces some memory or compute bottleneck but adds communication, scheduling, checkpointing, or load-balancing complexity."
    ),
    q(
      "math",
      ["global batch", "accumulation"],
      "How do you compute global tokens per optimizer step, and why does it matter?",
      "Global tokens per step equals sequence length times microbatch per device times data-parallel replicas times gradient accumulation steps. If sequence length is 4096, microbatch is 2, replicas are 64, and accumulation is 8, the update sees 4,194,304 tokens.\nIt matters because learning-rate schedules, gradient noise, throughput, and comparisons between runs depend on this value. Silent changes can make loss curves incomparable."
    ),
    q(
      "debugging",
      ["throughput", "communication"],
      "Tokens/sec stops scaling when you add nodes. How do you debug it?",
      "First profile where step time goes: dataloader wait, forward, backward, all-reduce, parameter gather, pipeline bubble, checkpointing, or optimizer step. Then compare GPU utilization, network bandwidth, collective timings, and per-rank stragglers.\nGood candidates avoid vague answers like 'network issue'. They identify whether the job is communication-bound, memory-bound, input-bound, or imbalanced, then propose a parallelism or batch-size change."
    ),
    q(
      "systems",
      ["checkpointing", "resume"],
      "What must be saved for a distributed training checkpoint to resume correctly?",
      "Model weights are not enough. Save optimizer state shards, scheduler state, precision scaler if used, RNG states, dataloader position or shard epoch, tokenizer/config, global step, and parallelism metadata.\nA strong answer says to test resume equivalence. If loss changes after resume, missing optimizer moments or dataloader/RNG state are likely culprits."
    ),
    q(
      "design",
      ["memory", "parallel strategy"],
      "A model does not fit on one GPU. How do you choose a parallelism strategy?",
      "Estimate memory for weights, gradients, optimizer state, activations, and KV/sequence-related buffers. If optimizer state dominates, FSDP/ZeRO helps. If layer matrices are too large, tensor parallelism helps. If layer stack is too deep, pipeline parallelism may help.\nThe final choice depends on interconnect, batch size, sequence length, model architecture, checkpointing cost, and implementation maturity. A strong answer proposes measuring rather than assuming."
    )
  ],
  "supervised-fine-tuning": [
    q(
      "core",
      ["sft", "masking"],
      "What exactly changes in SFT compared with pretraining?",
      "The loss is still next-token cross-entropy, but the data and masking change. The model conditions on prompts or conversations and is trained to imitate curated target response tokens, usually assistant tokens only.\nPretraining teaches broad continuation likelihood. SFT teaches response format, role behavior, task demonstrations, tone, and instruction response patterns. It does not inherently compare two answers or optimize human preferences."
    ),
    q(
      "debugging",
      ["role masks", "chat template"],
      "After SFT, the model starts imitating user messages. What likely went wrong?",
      "The loss mask probably included user tokens, or the chat template serialized roles incorrectly. The model learned to predict user turns, not only assistant outputs.\nDebug by printing token text, role, label value, and loss mask for several multi-turn examples. The fix is to mask system/user/tool-observation spans unless the training objective deliberately includes them."
    ),
    q(
      "design",
      ["data quality", "regression"],
      "How would you build an SFT dataset for customer support without damaging base capabilities?",
      "Use high-quality, diverse support examples with correct answers, role-consistent style, escalation behavior, refusal/uncertainty cases, and realistic multi-turn context. Deduplicate canned replies and avoid teaching unsupported claims.\nTo protect base capabilities, mix in capability-preserving examples or keep the update small, then evaluate code/math/reasoning/general instruction slices. SFT should not be judged only by customer-support tone."
    ),
    q(
      "math",
      ["loss", "weights"],
      "How can example weighting change SFT behavior?",
      "If the loss is a weighted sum over examples or tasks, higher-weight examples contribute more gradient. Upweighting JSON compliance, refusals, or support style will make those behaviors more likely.\nThe risk is overrepresentation. If refusal examples or verbose explanations are overweighted, the model may over-refuse or become verbose. Weighting is behavioral control, not just data bookkeeping."
    ),
    q(
      "systems",
      ["deployment", "templates"],
      "Why must the chat template be versioned in SFT?",
      "The model learns behavior conditioned on serialized role tokens, separators, system prompt placement, and assistant boundaries. If inference uses a different template, the model may see an out-of-distribution prompt.\nVersioning the template with the model lets you reproduce training, debug regressions, and prevent loading an SFT model under incompatible serving serialization."
    )
  ],
  "instruction-fine-tuning": [
    q(
      "core",
      ["instruction following"],
      "How is instruction tuning different from ordinary task fine-tuning?",
      "Ordinary task fine-tuning may teach one narrow input-output mapping. Instruction tuning teaches broad command-following across many tasks, formats, constraints, and conversational forms.\nThe goal is not only answer correctness; it is interpreting user intent, obeying constraints, respecting role hierarchy, asking clarifying questions when needed, and handling refusal or uncertainty cases."
    ),
    q(
      "debugging",
      ["constraints", "eval"],
      "A model gives correct answers but ignores 'answer in JSON only'. How do you fix and evaluate it?",
      "Fixing it requires constraint-focused instruction data, not just more correct answers. Include schema-following examples, negative examples where natural language is wrong, and varied prompt phrasings.\nEvaluate with exact parsability, required fields, forbidden extra text, and semantic correctness. A strong answer separates answer quality from instruction compliance."
    ),
    q(
      "design",
      ["data mixture", "generalization"],
      "What should an instruction-tuning mixture contain for a general assistant?",
      "It should include diverse task families: question answering, summarization, extraction, transformation, code, math, creative writing, refusals, uncertainty, multi-turn repair, format constraints, and multilingual requests if needed.\nIt should also include boundary examples: when to ask for clarification, when to abstain, and when to refuse. Template variety matters so the model learns instruction semantics rather than prompt artifacts."
    ),
    q(
      "systems",
      ["prompt template", "serving"],
      "Why can a system prompt change break an instruction-tuned model?",
      "Instruction tuning teaches the model under a particular role hierarchy and serialization format. A new system prompt can shift behavior, conflict with learned examples, or create out-of-distribution role patterns.\nProduction systems should treat system prompts as versioned artifacts, test prompt changes through evals, and roll them out like model changes."
    ),
    q(
      "debugging",
      ["safety", "over-refusal"],
      "The model refuses many benign requests after instruction tuning. What caused it?",
      "The tuning set likely overrepresented refusal examples or lacked allowed/disallowed contrastive boundary cases. The model learned superficial safety triggers instead of policy distinctions.\nFix by adding benign near-neighbor examples, measuring refusal precision and recall, and auditing prompts that resemble safety data but should be answered."
    )
  ],
  "lora-and-parameter-efficient-fine-tuning": [
    q(
      "math",
      ["lora", "parameters"],
      "Derive the number of trainable parameters LoRA adds to a linear layer.",
      "For a base matrix W with shape d_out by d_in, LoRA learns A and B with rank r, so the update has r*d_in + d_out*r = r(d_in + d_out) trainable parameters. The base matrix remains frozen.\nThis is much smaller than d_in*d_out for full fine-tuning. A strong answer also mentions scaling alpha/r and that target module choice controls where the low-rank updates apply."
    ),
    q(
      "core",
      ["peft", "tradeoff"],
      "When would you choose LoRA over full fine-tuning, and when would you not?",
      "Choose LoRA when the base model already has the capability, the adaptation is domain/style/task-specific, data is limited, memory is constrained, or you need many portable adapters.\nAvoid assuming LoRA is enough for broad capability shifts, severe base-model deficits, large tokenizer changes, or cases where adapter capacity and target modules underfit. Full fine-tuning may be needed for deeper behavior changes."
    ),
    q(
      "debugging",
      ["rank", "underfit"],
      "A LoRA run plateaus while full fine-tuning improves. What do you try?",
      "First check data quality and masks, then adapter capacity. Increase rank, target additional modules, tune alpha/dropout, or include MLP projections rather than only attention projections.\nIf the task requires broad representation change, LoRA may be the wrong tool. A strong answer compares against prompt-only and full fine-tuning baselines before changing knobs."
    ),
    q(
      "systems",
      ["serving", "adapters"],
      "What are the serving risks of using many LoRA adapters on one base model?",
      "You need correct adapter routing, batching by adapter compatibility, memory for loaded adapters, cache keys that include adapter ID, and safe hot-swapping. Wrong adapter selection can leak behavior across tenants.\nMerged adapters simplify inference but lose dynamic switching. Unmerged adapters preserve flexibility but complicate scheduler and performance behavior."
    ),
    q(
      "design",
      ["selection", "baselines"],
      "How would you decide between prompt engineering, LoRA, and RAG for a domain task?",
      "If the issue is missing current/private facts, use RAG. If the issue is stable style or task behavior and the base model has the skill, try prompting, then LoRA if prompting is insufficient. If the behavior needs broad policy or capability change, consider SFT/full tuning.\nA strong answer names evaluation criteria: task accuracy, latency, cost, maintenance, data freshness, and regression risk."
    )
  ],
  "preference-optimization": [
    q(
      "core",
      ["preference data"],
      "What information does a preference pair add beyond an SFT example?",
      "An SFT example says 'imitate this target output'. A preference pair says, for the same prompt, this output is better than that output. It gives relative quality information.\nThat comparison can teach subtle distinctions: helpful but concise beats verbose, correct beats plausible, grounded beats unsupported, safe boundary behavior beats blanket refusal. The quality depends entirely on the rubric and pair construction."
    ),
    q(
      "debugging",
      ["bias", "length"],
      "A preference-optimized model becomes verbose. What probably happened?",
      "The preference data likely correlated chosen labels with longer responses, or the reward/preference model learned verbosity as a proxy for helpfulness. This is a classic preference artifact.\nDiagnose chosen/rejected length distributions, inspect high-confidence pairs, and evaluate length-controlled comparisons. Fix with concise chosen examples, length-balanced pairs, and task-specific rubrics."
    ),
    q(
      "design",
      ["hard negatives", "data quality"],
      "What makes a good rejected answer in preference data?",
      "A good rejected answer is plausible and close enough to force the model to learn the real distinction. For math, it may have correct setup but a wrong final step. For RAG, it may be fluent but unsupported by evidence.\nTrivial bad answers teach shallow separation. Hard negatives create useful preference boundaries and reveal whether the model learns quality rather than style."
    ),
    q(
      "math",
      ["reward model", "pairwise loss"],
      "Explain the reward-model pairwise loss used in RLHF-style pipelines.",
      "A reward model scores chosen and rejected outputs. The common pairwise loss is -log sigmoid(r_chosen - r_rejected), which pushes the chosen score above the rejected score.\nA strong answer notes that the reward model is a proxy. If labels are biased, the reward model learns the bias and RL can exploit it aggressively."
    ),
    q(
      "systems",
      ["annotation", "versioning"],
      "What metadata should you keep for preference data?",
      "Store prompt, chosen output, rejected output, source models, decoding parameters, labeler or judge source, rubric version, timestamp, task category, and any safety or domain labels.\nWithout this, you cannot debug length bias, model-source artifacts, annotator drift, or why a preference-optimized model changed behavior."
    )
  ],
  "rlhf": [
    q(
      "core",
      ["pipeline", "reward model"],
      "Walk through the RLHF pipeline end to end.",
      "Start with a pretrained model, usually run SFT to get an initial assistant policy, generate candidate responses, collect human or preference labels, train a reward model on chosen/rejected pairs, then optimize the policy with an RL algorithm such as PPO while regularizing against a reference policy.\nThe answer should include evaluation and monitoring: reward score alone is not enough because the policy can exploit reward-model errors."
    ),
    q(
      "math",
      ["kl", "ppo"],
      "Why is there a KL penalty in RLHF?",
      "The policy is optimized to get high reward, but the reward model is imperfect. A KL penalty keeps the policy close to a reference model, usually the SFT policy, so it does not drift into strange high-reward regions.\nIf beta is too high, learning is blocked. If beta is too low, reward hacking and behavior drift become likely. Strong candidates discuss monitoring KL per token, reward, length, and human eval together."
    ),
    q(
      "debugging",
      ["reward hacking"],
      "Reward score improves but human preference gets worse. What do you do?",
      "Treat it as reward hacking or rubric mismatch until proven otherwise. Inspect high-reward samples for verbosity, sycophancy, refusal inflation, formatting hacks, false confidence, or unsafe behavior.\nMitigate by adding adversarial preference data, retraining the reward model, tuning KL, using heldout human evals, and measuring task-specific success rather than only reward."
    ),
    q(
      "systems",
      ["rollouts", "cost"],
      "Why is RLHF operationally harder than SFT or DPO?",
      "RLHF requires online or iterative sampling from the current policy, reward-model inference, reference logprobs, advantage estimation, policy updates, and careful distributed coordination. Generation is sequential and expensive.\nIt also has more moving artifacts: policy, reference, reward model, prompts, sampling settings, and PPO hyperparameters. Debugging is harder because regressions can come from any of these."
    ),
    q(
      "design",
      ["evaluation", "alignment"],
      "How would you evaluate whether RLHF actually helped?",
      "Use heldout human preferences, task success, factuality/grounding, safety, refusal precision, length distribution, latency/cost, and examples where reward and humans disagree.\nA strong answer rejects relying on reward-model score alone. The reward model is part of training, so it cannot be the only judge of final quality."
    )
  ],
  "dpo": [
    q(
      "core",
      ["dpo", "preference"],
      "Explain DPO in plain English and how it differs from RLHF.",
      "DPO trains directly on preference pairs by increasing the policy's reference-relative probability of chosen responses compared with rejected responses. It avoids training a separate reward model and avoids online PPO-style rollouts.\nIt is simpler operationally than RLHF, but it still depends heavily on high-quality preference data and an appropriate reference policy."
    ),
    q(
      "math",
      ["objective", "log ratios"],
      "What is the role of log-probability ratios in DPO?",
      "DPO compares how much more the current policy favors the chosen answer over the rejected answer relative to the reference policy. The margin uses differences of log probabilities for chosen and rejected outputs under policy and reference.\nThis means DPO is not just maximizing chosen likelihood. It is changing preference relative to a baseline, with beta controlling update strength."
    ),
    q(
      "debugging",
      ["beta", "overfit"],
      "DPO training pair accuracy improves but heldout behavior worsens. What are likely causes?",
      "Preference pairs may be noisy, biased, or too easy; beta may be too aggressive; the model may be overfitting length/style artifacts; or the reference model may be a poor anchor.\nDebug by auditing pair quality, chosen/rejected length, heldout pair accuracy, downstream evals, and examples with high loss or high confidence."
    ),
    q(
      "systems",
      ["reference", "precompute"],
      "What can be precomputed in DPO and what must remain fixed?",
      "Reference-model log probabilities can often be precomputed if the reference model, tokenizer, chat template, and dataset are fixed. This can reduce training cost.\nIf any of those artifacts change, cached reference logprobs are invalid. A strong answer emphasizes artifact pinning and sequence-level logprob consistency."
    ),
    q(
      "design",
      ["method choice"],
      "When would you prefer DPO over PPO-style RLHF?",
      "Prefer DPO when you have a strong static preference dataset, want a simpler and more stable training pipeline, and do not need online exploration from a reward model.\nPPO-style RLHF may be more appropriate when you need iterative reward-guided exploration, but it costs more and is easier to destabilize."
    )
  ],
  "grpo-rl-style-reasoning-optimization": [
    q(
      "core",
      ["group rewards", "reasoning"],
      "What is the core idea of GRPO-style reasoning optimization?",
      "Generate multiple completions for the same prompt, score them with a verifier or reward, and update the policy using advantages computed relative to that group. Samples that beat their siblings receive positive learning signal; weaker samples receive negative signal.\nThis is useful for math/code reasoning where final-answer checks or tests can score multiple attempts."
    ),
    q(
      "math",
      ["advantage", "normalization"],
      "Given rewards [1, 0, 1, 0], what are the group-relative advantages?",
      "The mean is 0.5 and the standard deviation is 0.5, so normalized advantages are [1, -1, 1, -1] if using (r - mean) / std.\nA strong answer also notes that if all rewards are identical, the group has no useful relative signal. Zero-variance groups are a training problem."
    ),
    q(
      "debugging",
      ["length drift", "reward hacking"],
      "A reasoning-optimized model becomes much more verbose without accuracy gains. Diagnose it.",
      "The reward may correlate with longer reasoning traces, or the KL/length controls are too weak. The model learned that spending more tokens increases reward or exploration chance.\nTrack reasoning length, pass@1, pass@k, reward, KL, and cost-adjusted accuracy. Mitigate with length-aware rewards, stricter budgets, better verifier design, or stronger KL."
    ),
    q(
      "systems",
      ["sampling", "verifier"],
      "Why is GRPO-style training expensive operationally?",
      "Each prompt requires multiple sampled completions, then verifier or reward scoring for each completion. Code rewards may require sandboxed execution, timeouts, and deterministic tests.\nThe system must store completions, rewards, advantages, policy logprobs, and reference/KL information. Sampling and scoring throughput often become bottlenecks."
    ),
    q(
      "design",
      ["verifier", "eval"],
      "How do you design rewards for reasoning without teaching shortcut hacks?",
      "Separate final-answer correctness from format compliance and process quality. Use robust parsers, hidden tests for code, adversarial math cases, and checks that penalize invalid or unsupported reasoning.\nA good answer says to inspect high-reward traces. If the verifier only checks superficial patterns, the model will optimize those patterns."
    )
  ],
  "evaluation-of-llms": [
    q(
      "design",
      ["eval design"],
      "How do you design an eval for a new LLM feature?",
      "Start with the decision the eval will inform: ship, rollback, choose model, tune retriever, or change prompt. Define the target behavior, failure costs, representative tasks, slices, and baseline.\nThen choose metrics: exact checks, human review, model judge, latency, cost, safety, or task success. Store examples, expected answers, grader version, model version, prompt, decoding settings, and artifacts so failures are reproducible."
    ),
    q(
      "math",
      ["uncertainty", "sample size"],
      "A model improves from 82% to 84% accuracy on 100 examples. How should you treat that?",
      "With n=100, standard error for a binary metric near 0.83 is roughly sqrt(p(1-p)/n), around 3.8 percentage points. A 2-point gain may be noise.\nA strong answer asks for confidence intervals, paired evaluation, slices, qualitative examples, and whether the eval set is representative before using the result to ship."
    ),
    q(
      "debugging",
      ["judge bias", "model-as-judge"],
      "What are the failure modes of model-as-judge evaluation?",
      "Judges can prefer longer, more confident, or stylistically familiar answers; be sensitive to order; miss domain-specific facts; leak rubric artifacts; and be poorly calibrated against humans.\nMitigate with pair-order randomization, calibration sets, human audits, rubric-specific checks, reference answers, and disagreement analysis."
    ),
    q(
      "systems",
      ["versioning", "reproducibility"],
      "Why do LLM eval logs need more than prompt and response?",
      "You need model version, prompt template, system prompt, decoding settings, tool versions, retrieval index, chunker, reranker, grader version, latency, token counts, and timestamps.\nWithout full artifact versioning, you cannot attribute a regression to model weights, prompt changes, retrieval changes, serving config, or grader drift."
    ),
    q(
      "core",
      ["contamination", "benchmarks"],
      "Why are public benchmarks not enough for production LLM evaluation?",
      "They may be contaminated, overfit, or mismatched to your users. They often underrepresent domain-specific workflows, private data, safety policy, latency, tool use, and cost.\nUse public benchmarks for broad signal, but make private task-specific regression sets and online monitoring the release gate."
    )
  ],
  "rag-fundamentals": [
    q(
      "design",
      ["rag vs fine-tuning"],
      "When should you use RAG instead of fine-tuning?",
      "Use RAG when the needed knowledge is private, current, large, frequently changing, or must be cited. RAG updates context at inference time without changing model weights.\nUse fine-tuning for stable behavior, style, format, or skills. A strong answer notes that many production systems combine them: fine-tune behavior or retrievers, use RAG for factual grounding."
    ),
    q(
      "debugging",
      ["retrieval", "generation"],
      "A RAG answer is wrong. What is your first debugging split?",
      "Ask whether the required evidence was retrieved. If not, debug ingestion, chunking, embeddings, hybrid search, metadata filters, query rewrite, and recall@k. If yes, debug reranking, context assembly, prompt grounding, citations, and generation.\nThis split matters because prompt engineering cannot fix missing evidence, and retriever changes may not fix unsupported synthesis."
    ),
    q(
      "systems",
      ["pipeline", "observability"],
      "What should a production RAG trace log?",
      "Log user query, rewritten query if any, filters, candidate document IDs, scores, reranked order, final context, prompt version, generated answer, citations, latency per stage, index version, and failure labels.\nWithout this, a RAG system becomes impossible to debug because retrieval, context, and generation failures look the same from the final answer."
    ),
    q(
      "math",
      ["metrics", "recall"],
      "Explain recall@k and why it is usually the first RAG retrieval metric.",
      "Recall@k measures whether at least one relevant document or chunk appears in the top k retrieved candidates. If recall is low, the generator never receives the evidence needed to answer.\nIt is first because it tests retriever coverage. After recall is acceptable, evaluate ranking quality, context precision, faithfulness, and final answer accuracy."
    ),
    q(
      "debugging",
      ["freshness", "staleness"],
      "A RAG assistant gives stale answers even though the LLM is strong. What do you inspect?",
      "Inspect ingestion freshness, document update/delete handling, index version, metadata filters, cache behavior, and whether the old document ranks above the new one. Also check if the prompt allows prior model knowledge to override retrieved evidence.\nA strong answer proposes freshness evals and source-date handling in generation."
    )
  ],
  "embeddings-and-vector-search": [
    q(
      "core",
      ["embeddings", "similarity"],
      "What is an embedding, and what does vector similarity actually mean?",
      "An embedding is a vector representation learned so that texts with related meaning or use are close under a similarity metric. Similarity means closeness in that model's embedding space, not guaranteed relevance, truth, or answer sufficiency.\nA strong answer says embeddings are task- and model-dependent. The same query/document pair can rank differently with another embedding model or metric."
    ),
    q(
      "math",
      ["cosine", "dot product"],
      "When are cosine similarity and dot product equivalent for ranking?",
      "They are equivalent when vectors are normalized to unit length, because cosine(q,d) becomes q dot d. If vectors are not normalized, dot product is affected by vector norms.\nA good answer notes that you must match the metric expected by the embedding model and vector index. Wrong normalization can quietly hurt retrieval."
    ),
    q(
      "debugging",
      ["hybrid search", "identifiers"],
      "Why does vector search often fail on IDs, error codes, or exact API names?",
      "Dense embeddings emphasize semantic similarity and can blur rare lexical tokens. Error code E042, function names, or product IDs may be critical but not semantically represented well.\nUse hybrid retrieval with BM25 or lexical search, preserve exact tokens in chunks, and evaluate identifier-heavy queries separately."
    ),
    q(
      "systems",
      ["ann", "latency"],
      "What tradeoff does approximate nearest neighbor search introduce?",
      "ANN indexes trade exact recall for speed and memory efficiency. Parameters such as search breadth, graph degree, or probes control the recall-latency curve.\nA strong answer says to benchmark ANN recall against exact search on a sample and tune separately for candidate recall and end-to-end answer quality."
    ),
    q(
      "design",
      ["filters", "permissions"],
      "How can metadata filters both help and hurt vector search?",
      "Filters help enforce tenant permissions, document type, recency, locale, and product scope. They hurt when metadata is wrong or overly strict, removing the relevant document before ranking.\nA production answer logs pre-filter and post-filter candidate counts and treats authorization filters as mandatory code-level controls, not optional prompt instructions."
    )
  ],
  "chunking-and-indexing": [
    q(
      "design",
      ["chunking"],
      "How do you choose chunk size and overlap for RAG?",
      "Choose based on the unit of evidence, not a universal number. API docs may need function-level chunks plus examples; policies may need section-level chunks with definitions; long reports may need hierarchical summaries.\nOverlap reduces boundary loss but increases redundancy and index size. A good answer proposes evaluating retrieval recall, context precision, and final answer quality across chunking strategies."
    ),
    q(
      "math",
      ["chunk count"],
      "Given document length L, chunk size c, and overlap o, estimate number of chunks.",
      "Approximate chunks as ceil((L - o) / (c - o)) for L greater than c. Overlap reduces stride, so it increases chunk count, storage, embedding cost, and reranking load.\nA strong answer also says this formula is only approximate because structural chunking should respect headings, tables, and code blocks."
    ),
    q(
      "debugging",
      ["boundary loss"],
      "The correct answer requires two adjacent chunks, but retrieval returns only one. What do you change?",
      "This is boundary loss. Use larger structural chunks, targeted overlap, parent-child retrieval, heading-path context, or query decomposition so related sections are retrieved together.\nDo not blindly increase chunk size. Larger chunks can reduce precision and flood the prompt with irrelevant text."
    ),
    q(
      "systems",
      ["indexing", "freshness"],
      "What does a production indexing pipeline need beyond embeddings?",
      "It needs document IDs, source URLs, offsets, headings, permissions, timestamps, versioning, tombstones for deletes, update jobs, retry handling, deduplication, and validation that index contents match source-of-truth documents.\nIndex freshness and permissions are correctness requirements, not metadata niceties."
    ),
    q(
      "debugging",
      ["redundancy", "top-k"],
      "Top-k retrieval returns five near-duplicate chunks from the same section. What is wrong?",
      "Overlap may be too high, deduplication/diversification is missing, or the retriever lacks diversity constraints. The final context wastes budget on redundant evidence.\nMitigate with reduced overlap, maximum marginal relevance, parent grouping, near-duplicate collapse, or reranking that favors diverse support."
    )
  ],
  reranking: [
    q(
      "core",
      ["reranking", "retrieval"],
      "What problem does reranking solve in a RAG pipeline?",
      "First-stage retrieval is optimized for fast candidate recall, not necessarily final relevance. A reranker scores query-document pairs more deeply and reorders candidates so the final context has more relevant evidence.\nIt does not recover documents absent from the candidate set. A strong answer says retrieval top-k must be broad enough before reranking can help."
    ),
    q(
      "design",
      ["bi-encoder", "cross-encoder"],
      "Compare a bi-encoder retriever with a cross-encoder reranker.",
      "A bi-encoder embeds query and document separately, enabling fast approximate search over precomputed document vectors. A cross-encoder reads query and document together, capturing token-level interactions but requiring per-pair inference.\nThe common design is retrieve top-k cheaply with a bi-encoder or hybrid search, then rerank a smaller candidate set with a stronger model."
    ),
    q(
      "math",
      ["mrr", "ranking"],
      "Why is MRR useful for reranking evaluation?",
      "Mean reciprocal rank rewards placing the first relevant document near the top. If the relevant chunk moves from rank 20 to rank 2, MRR improves substantially.\nIt is useful when the generator only sees a small final context. However, also measure recall and final answer quality because rank alone does not guarantee grounded synthesis."
    ),
    q(
      "systems",
      ["latency", "top-k"],
      "Reranking improves accuracy but doubles p95 latency. What knobs do you tune?",
      "Tune first-stage top-k, final top-n, reranker model size, batching, caching, and conditional reranking. Also check whether hybrid retrieval can improve candidate quality with fewer candidates.\nThe answer should acknowledge that reranking is a latency-quality tradeoff and should be evaluated under realistic traffic."
    ),
    q(
      "debugging",
      ["candidate recall"],
      "A reranker seems useless. How do you tell if the issue is reranker quality or candidate recall?",
      "Inspect whether relevant documents appear in the initial candidate set. If they do not, the retriever is the bottleneck. If they do appear but are demoted or not selected, the reranker or final context policy is the bottleneck.\nLog ranks before and after reranking with known relevant labels."
    )
  ],
  "grounded-generation": [
    q(
      "core",
      ["grounding", "citations"],
      "What is the difference between a correct answer and a grounded answer?",
      "A correct answer is true. A grounded answer is supported by the provided evidence. In RAG, the latter matters because the system is supposed to answer from retrieved context and cite sources.\nA true answer can still be a product failure if it is unsupported, uncited, or based on the model's prior knowledge when the user asked for source-grounded output."
    ),
    q(
      "debugging",
      ["citation validity"],
      "The answer has citations, but users still complain it hallucinates. What do you check?",
      "Check citation precision at the claim level. A citation is valid only if the cited span directly supports the claim it is attached to.\nModels often citation-launder: they attach plausible sources without support. Evaluate claim extraction, source-span support, unsupported claims, and whether citations point to stale or irrelevant documents."
    ),
    q(
      "design",
      ["abstention", "uncertainty"],
      "How should a grounded generation system behave when evidence is missing?",
      "It should abstain, state what is missing, ask a clarifying question, or provide a bounded answer with uncertainty, depending on the product. It should not invent evidence.\nA strong answer includes unanswerable eval cases and prompt instructions that explicitly separate supported claims from guesses."
    ),
    q(
      "systems",
      ["prompt injection", "untrusted context"],
      "Why should retrieved documents be treated as untrusted input?",
      "Retrieved text can contain malicious instructions, stale policy, user-generated content, or prompt injection. It should be framed as evidence, not as instructions that can override system or developer messages.\nUse context boundaries, instruction hierarchy, filtering, and output validation. This is especially important when the model has tools or private context."
    ),
    q(
      "math",
      ["metrics", "faithfulness"],
      "How would you measure grounding quality?",
      "Use claim support rate, citation precision, faithfulness, unsupported-claim count, answer correctness, and abstention quality on unanswerable cases.\nA strong answer separates faithfulness from correctness. The answer can be faithful but incomplete, correct but unsupported, or supported by the wrong citation."
    )
  ],
  "rag-evaluation": [
    q(
      "core",
      ["pipeline metrics"],
      "What metrics would you report for a RAG system?",
      "Report retrieval recall@k, MRR or nDCG, context precision, answer correctness, faithfulness, citation validity, abstention accuracy, latency per stage, and cost.\nA strong answer segments by question type, corpus section, answerable/unanswerable, and user workflow. One aggregate score hides the pipeline failure mode."
    ),
    q(
      "debugging",
      ["high recall low accuracy"],
      "Recall@20 is 95%, but answer accuracy is 55%. What do you debug?",
      "First-stage retrieval is mostly finding the evidence. Debug reranking, final top-n selection, context ordering, prompt assembly, grounding instructions, context overload, and generator behavior.\nAlso inspect examples where the relevant chunk was retrieved but omitted from final context. The next fix is likely not more embeddings."
    ),
    q(
      "design",
      ["eval set"],
      "What labels should a gold RAG eval set contain?",
      "Each example should include the question, expected answer, relevant source IDs or spans, answerable/unanswerable flag, expected citation spans, task category, difficulty, and freshness/version metadata.\nFor production, include adversarial and no-evidence cases. Otherwise the system can look good while hallucinating unsupported answers."
    ),
    q(
      "math",
      ["precision", "recall"],
      "Explain context precision versus retrieval recall.",
      "Retrieval recall asks whether relevant evidence appears somewhere in the candidate set. Context precision asks how much of the final context shown to the model is actually relevant.\nHigh recall with low context precision means the evidence exists but is buried in noise. Low recall means the generator never had the needed evidence."
    ),
    q(
      "systems",
      ["regression", "index version"],
      "Why must RAG evals run against versioned indexes?",
      "The same source corpus can produce different retrieval behavior after chunking, embedding, metadata, permissions, or index parameter changes. If you only version source documents, you cannot reproduce what the model saw.\nVersion the index and retrieval configuration as first-class eval artifacts."
    )
  ],
  "inference-serving": [
    q(
      "core",
      ["prefill", "decode"],
      "Explain prefill versus decode in LLM serving.",
      "Prefill processes the input prompt and builds hidden states and KV cache for the prompt tokens. It is parallel over the prompt sequence and scales with prompt length.\nDecode generates output tokens autoregressively, one step at a time. It scales with output length and active batch. Many latency and throughput decisions come from separating these two phases."
    ),
    q(
      "systems",
      ["latency", "trace"],
      "Break down the latency of an LLM request.",
      "A complete breakdown includes ingress/network, prompt assembly, tokenization, queue wait, prefill, decode, streaming time to first token, post-processing, and egress.\nA strong answer says to log prompt tokens, output tokens, model version, batch size, queue state, and error/cancellation status. Without stage timing, latency debugging is guesswork."
    ),
    q(
      "debugging",
      ["saturation", "queues"],
      "p95 latency spikes while p50 stays acceptable. What is happening?",
      "Tail latency often means queueing under burst load, long prompts/outputs, head-of-line blocking, cold replicas, or a small class of huge requests. The average request is fine, but tail requests wait or monopolize decode.\nInspect waiting requests, running requests, token lengths, batch occupancy, and per-stage p95. Fix with capacity, scheduling, quotas, or request-class separation."
    ),
    q(
      "design",
      ["streaming", "ux"],
      "Does streaming make inference cheaper or faster?",
      "Streaming improves perceived latency by sending tokens as they are generated, reducing time to first visible output. It does not reduce total decode compute by itself.\nIt can improve UX and allow cancellation, which may save work if users stop early. But the core compute cost remains tied to prompt and generated tokens."
    ),
    q(
      "systems",
      ["autoscaling", "gpu"],
      "Why is autoscaling LLM serving harder than autoscaling a stateless web API?",
      "GPU replicas are expensive, slow to warm, require model weight loading, have memory residency constraints, and can be limited by KV cache or batching policy. Capacity is not just request count; it is token length distribution and active sequences.\nA strong answer mentions warm pools, admission control, queue backpressure, and per-class routing."
    )
  ],
  "kv-cache": [
    q(
      "core",
      ["kv cache", "decode"],
      "What is the KV cache and why is it important?",
      "The KV cache stores attention keys and values for previous tokens at each layer, so during autoregressive decoding the model does not recompute the full prefix at every new token.\nIt is crucial for decode speed, but it consumes memory proportional to active sequence length and batch. Long-context serving is often KV-cache constrained."
    ),
    q(
      "math",
      ["memory", "capacity"],
      "Derive the KV cache memory formula.",
      "Approximate KV bytes as 2 * layers * batch * sequence_length * heads * head_dim * bytes_per_element. The factor 2 is for keys and values.\nA strong answer notes variations: grouped-query attention changes key/value head count, quantized cache changes bytes per element, and paged allocation changes fragmentation but not the basic scaling."
    ),
    q(
      "debugging",
      ["oom", "long context"],
      "A model loads fine but OOMs only during long conversations. What is likely happening?",
      "Weights fit, but KV cache grows with prompt plus generated tokens and active batch. Long conversations consume more cache until capacity is exceeded.\nMitigate by lowering max context/output, using paged cache, reducing concurrency, quantizing KV cache if supported, or adding memory. Also inspect fragmentation."
    ),
    q(
      "systems",
      ["paged attention", "fragmentation"],
      "What problem does paged attention solve?",
      "Paged attention stores KV cache in blocks/pages rather than requiring large contiguous allocations. This reduces memory waste and fragmentation for variable-length requests.\nIt enables larger effective batches and continuous batching because requests can grow and finish without forcing rigid contiguous cache layouts."
    ),
    q(
      "design",
      ["prefix caching", "correctness"],
      "What must be included in a safe prefix-cache key?",
      "Include model version, adapter ID, tokenizer/template version, exact tokenized prefix, decoding-relevant settings, and any state that changes hidden activations. Otherwise the server may reuse cache from an incompatible request.\nInvalid cache reuse is a correctness bug, not just a performance issue."
    )
  ],
  "batching-and-continuous-batching": [
    q(
      "core",
      ["batching", "throughput"],
      "Why does batching increase throughput but sometimes hurt latency?",
      "Batching makes GPU operations larger and improves utilization, so tokens/sec can rise. But forming or maintaining a batch adds queue wait and can make individual users wait longer.\nA strong answer distinguishes system throughput from user latency and says batching policy must be tied to the product SLO."
    ),
    q(
      "systems",
      ["continuous batching", "scheduler"],
      "What is continuous batching?",
      "Continuous batching lets requests enter and leave the active batch at token boundaries instead of waiting for an entire static batch to finish. As one request completes, another can fill the slot.\nThis keeps decode hardware more utilized, especially with variable output lengths. It requires scheduler integration with KV cache allocation."
    ),
    q(
      "debugging",
      ["head-of-line blocking"],
      "Short requests get slow whenever long generations arrive. Diagnose it.",
      "This is head-of-line blocking or poor request-class isolation. Long outputs occupy decode slots and KV cache, making short interactive requests wait.\nMitigate with max token limits, separate pools, priority queues, preemption, cancellation, or scheduling policies that protect short requests."
    ),
    q(
      "math",
      ["queueing", "latency"],
      "How does batching change user latency in a simple formula?",
      "User latency equals wait time plus service time. Batching may reduce service time per token by improving GPU efficiency, but it can increase wait time while the scheduler collects work.\nThe right batch policy minimizes latency under a throughput and cost constraint, not maximum batch size blindly."
    ),
    q(
      "systems",
      ["kv memory", "capacity"],
      "Why can increasing batch size hit a memory wall before compute saturates?",
      "Each active sequence needs KV cache proportional to its prompt and generated tokens. Larger batches increase active cache memory.\nIf KV memory is the bottleneck, adding batch size causes OOM or fragmentation even if GPU compute is not fully saturated."
    )
  ],
  quantization: [
    q(
      "core",
      ["quantization", "types"],
      "Compare weight-only, activation, and KV-cache quantization.",
      "Weight-only quantization stores model weights in lower precision and is common for inference memory savings. Activation quantization lowers intermediate tensor precision and can be more sensitive. KV-cache quantization reduces memory for active sequences during serving.\nA strong answer says each type has different quality, kernel, calibration, and hardware constraints."
    ),
    q(
      "math",
      ["memory", "bits"],
      "Estimate memory savings from 16-bit to 4-bit weights for a 7B model.",
      "16-bit weights use about 7B * 2 bytes = 14 GB. 4-bit weights use about 7B * 0.5 bytes = 3.5 GB before scales and metadata.\nThe answer should include the caveat that runtime memory also includes KV cache, activations/workspace, and quantization metadata."
    ),
    q(
      "debugging",
      ["quality", "outliers"],
      "A quantized model is fast but fails math and code. What happened?",
      "Quantization error may be damaging sensitive layers, attention/MLP outlier channels, or rare-token behavior. Math and code can be more brittle than casual chat.\nTry higher precision, better calibration data, group-wise scales, mixed precision for sensitive modules, or a different quantization method. Evaluate by domain slice, not global chat quality."
    ),
    q(
      "systems",
      ["kernels", "latency"],
      "Why can a quantized model be smaller but not faster?",
      "Speedup depends on hardware and optimized kernels. If the runtime dequantizes inefficiently, lacks low-bit matmul kernels, or is bottlenecked by decode scheduling or CPU work, memory savings may not translate to latency gains.\nAlways benchmark on the exact serving stack and measure prefill and decode separately."
    ),
    q(
      "design",
      ["calibration", "deployment"],
      "What calibration data should you use for quantization?",
      "Use representative prompts from the deployment distribution, including long prompts, domain terms, code/math if relevant, multilingual slices, and instruction formats.\nBad calibration misses activation ranges and causes deployment-specific quality loss. Calibration is part of the model artifact and should be versioned."
    )
  ],
  "speculative-decoding": [
    q(
      "core",
      ["draft model", "verifier"],
      "Explain speculative decoding in one rigorous answer.",
      "A small or faster draft model proposes multiple future tokens. The target model verifies those proposals, accepting tokens that match the target distribution under the algorithm and rejecting when needed.\nIf many draft tokens are accepted, the target model effectively advances multiple tokens per expensive pass. If acceptance is low, draft overhead can erase the benefit."
    ),
    q(
      "math",
      ["acceptance", "speedup"],
      "What determines speculative decoding speedup?",
      "The main variables are draft cost, verifier cost, draft block length, acceptance rate, and scheduling overhead. Expected accepted tokens per block are roughly block_length times acceptance_rate.\nA strong answer says speedup is workload-specific. Code, math, or unusual domains may have lower acceptance than generic chat."
    ),
    q(
      "debugging",
      ["latency", "acceptance"],
      "Speculative decoding shows high acceptance but no p95 latency gain. Why?",
      "Scheduler overhead, extra memory pressure, poor batching interaction, draft model contention, or target verification shape may cancel token savings. High average acceptance alone is not enough.\nProfile draft time, verify time, queue wait, batch occupancy, cache memory, and p50/p95 separately."
    ),
    q(
      "systems",
      ["tokenizer", "compatibility"],
      "Why can tokenizer mismatch break speculative decoding?",
      "Draft and target tokens must be comparable. If token boundaries differ, proposed tokens may not map cleanly to target-model verification.\nProduction systems usually use a compatible draft model or a carefully implemented mapping. Otherwise acceptance logic and KV cache state can become incorrect."
    ),
    q(
      "design",
      ["routing", "workload"],
      "How would you decide when to enable speculative decoding?",
      "Measure acceptance rate and latency by workload slice, not globally. Enable it where acceptance is high and overhead is low, such as common chat patterns, and disable or route around it for slices where it hurts.\nA strong answer includes fallback policy and monitoring because acceptance can drift after model, prompt, or traffic changes."
    )
  ],
  "latency-throughput-and-cost": [
    q(
      "core",
      ["metrics", "latency"],
      "Define TTFT, ITL, p95 latency, throughput, and cost per successful task.",
      "TTFT is time to first token. ITL is inter-token latency during streaming. p95 latency is the 95th percentile user wait time. Throughput is work completed per time, often tokens/sec. Cost per successful task divides total cost by tasks completed correctly.\nA strong answer says these metrics can conflict. Optimizing throughput can hurt TTFT; cheaper tokens can cost more if quality drops and retries increase."
    ),
    q(
      "math",
      ["cost", "gpu"],
      "A GPU costs $4/hour and a request occupies 8 GPU-seconds. Estimate raw GPU cost per request.",
      "$4/hour is $4/3600 per second. Multiply by 8 seconds: about $0.0089 per request.\nThen caveat: real cost includes utilization, replicas, idle headroom, retries, networking, storage, and engineering overhead. Interviewers want the arithmetic and the caveats."
    ),
    q(
      "debugging",
      ["tails", "queueing"],
      "Average latency is fine, but users complain. What do you inspect?",
      "Inspect p95/p99, TTFT, queue time, long prompt/output distributions, request classes, retries, cold starts, and saturation. Average latency hides tails.\nUse traces to find whether a small number of long requests, batching wait, or GPU saturation is hurting interactive users."
    ),
    q(
      "design",
      ["tradeoff", "routing"],
      "How do you compare a cheaper slower model with a faster expensive one?",
      "Compare under the same task distribution and success criteria. Measure quality, retries, latency SLO compliance, escalation rate, token usage, and cost per successful task.\nThe cheaper model wins only if it meets quality and latency requirements after accounting for retries and failures. A strong answer refuses to compare by token price alone."
    ),
    q(
      "systems",
      ["capacity", "traffic"],
      "Why is average prompt length a bad capacity-planning statistic?",
      "LLM cost and latency are dominated by token distributions and tails. A few very long prompts or outputs can consume disproportionate KV cache, decode slots, and queue time.\nPlan with percentiles and request classes: p50/p95 prompt tokens, output tokens, concurrent active tokens, and burst arrival patterns."
    )
  ],
  "deployment-and-monitoring": [
    q(
      "systems",
      ["versioning", "release"],
      "What is the deployable artifact in an LLM product?",
      "It is not only the model checkpoint. It includes tokenizer, adapter, prompt templates, decoding config, retrieval index, chunker, reranker, tool schemas, guardrail policy, evaluation suite, and serving runtime.\nA serious release pins and logs all of these. Any one of them can change user-visible behavior."
    ),
    q(
      "design",
      ["canary", "rollback"],
      "Design a safe rollout process for a new model or prompt.",
      "Run offline eval gates, shadow traffic if possible, canary to a small traffic slice, monitor quality/safety/latency/cost, then gradually ramp. Define rollback criteria before rollout.\nGood rollback criteria include critical eval regression, unsupported claims, refusal spikes, latency SLO breach, tool errors, or cost anomalies."
    ),
    q(
      "debugging",
      ["semantic outage"],
      "The service is up, but answers are wrong. What monitoring was missing?",
      "HTTP health checks were insufficient. You need semantic monitoring: sampled quality review, task success proxies, grounding/citation checks, refusal rates, retrieval metrics, tool error rates, user corrections, and eval canaries.\nA strong answer calls this a semantic outage and ties it to artifact changes."
    ),
    q(
      "math",
      ["anomaly", "cost"],
      "How would you detect a token-cost runaway?",
      "Track tokens per request, output length, retry rate, tool-loop count, and cost per workflow against historical baselines. Simple z-score or percentile alerts can catch spikes.\nThen inspect root cause: prompt expansion, longer outputs, model change, retries, agent loop, RAG context bloat, or traffic mix shift."
    ),
    q(
      "systems",
      ["logs", "privacy"],
      "What should production traces include while respecting privacy?",
      "Include artifact versions, timing, token counts, retrieval IDs, tool call metadata, safety decisions, error labels, and redacted or hashed content when raw text is sensitive.\nThe answer should balance debuggability with data minimization. Logging everything raw can create a privacy incident; logging nothing prevents incident response."
    )
  ],
  "agents-and-tool-use": [
    q(
      "core",
      ["agents", "tool calling"],
      "What makes an LLM agent different from a chatbot?",
      "An agent can choose actions, call tools, observe results, update state, and continue toward a goal. A chatbot primarily generates text.\nThe important system boundary is that the model proposes structured actions, but the runtime validates schemas, permissions, idempotency, and safety before execution."
    ),
    q(
      "design",
      ["tool schema", "validation"],
      "How do you design a safe tool schema?",
      "Use typed required fields, enums, bounds, explicit units, resource IDs instead of free text when possible, clear descriptions, and validation before execution. Separate read-only tools from side-effecting tools.\nFor risky writes, require confirmation, permission checks, idempotency keys, and audit logs. Do not rely on prompt instructions as the only guardrail."
    ),
    q(
      "debugging",
      ["tool loops", "termination"],
      "An agent calls the same search tool repeatedly and never answers. How do you fix it?",
      "Add max-step limits, repeated-call detection, better observation summaries, stopping criteria, and a verifier that forces answer/abstain decisions after enough evidence.\nAlso inspect whether tool results are ambiguous or whether the model lacks confidence thresholds. Looping is usually a harness and state-management failure, not just a prompt problem."
    ),
    q(
      "systems",
      ["idempotency", "side effects"],
      "Why is idempotency critical for agent tools?",
      "Agents retry after timeouts, parsing errors, or uncertain observations. If a side-effecting action is not idempotent, retries can send duplicate emails, charge twice, delete twice, or create inconsistent state.\nUse idempotency keys, confirmation steps, durable state, and tool-level protection. The runtime must enforce this outside the model."
    ),
    q(
      "debugging",
      ["observations", "prompt injection"],
      "How can tool observations become a security problem?",
      "Tool outputs are untrusted data. A webpage, email, document, or API response can contain instructions that try to redirect the model or exfiltrate data.\nSeparate observations from trusted instructions, restrict tool permissions, sanitize or summarize untrusted content, and validate final actions before execution."
    )
  ],
  "safety-guardrails-and-production-failure-modes": [
    q(
      "core",
      ["guardrails", "layers"],
      "Why are guardrails not just better prompts?",
      "Prompts can guide behavior, but production safety also needs input filters, retrieval permissions, tool authorization, schema validation, output checks, monitoring, rate limits, human approval, and incident response.\nA strong answer treats safety as layered system design. The model should not be trusted to enforce every policy about data and side effects."
    ),
    q(
      "debugging",
      ["prompt injection", "rag"],
      "How do you defend against indirect prompt injection in RAG?",
      "Treat retrieved documents as untrusted evidence, not instructions. Use prompt boundaries, instruction hierarchy, retrieval filtering, injection detection, citation/grounding checks, and prevent retrieved text from authorizing tool use.\nIf tools are available, enforce permissions outside the model. The key idea is separating trusted control text from untrusted data."
    ),
    q(
      "systems",
      ["data leakage", "permissions"],
      "A model reveals another tenant's document. Where can the failure be?",
      "Possible failures include index-time permission metadata, query-time filters, cache keys, prompt assembly, logging/replay tooling, tool access, or cross-session memory. It is not necessarily a model problem.\nMitigation requires code-level access control, tenant-aware retrieval, context minimization, audit logs, and tests that attempt cross-tenant retrieval."
    ),
    q(
      "math",
      ["precision recall", "safety classifier"],
      "How do precision and recall apply to a safety guardrail?",
      "Guardrail precision asks: when it blocks, how often was the content actually unsafe? Low precision means overblocking. Recall asks: of unsafe cases, how many did it catch? Low recall means unsafe content slips through.\nA rigorous answer says acceptable tradeoff depends on risk. A medical or financial write action may favor recall; a benign assistant may need higher precision to avoid useless over-refusal."
    ),
    q(
      "design",
      ["incident response", "failure modes"],
      "Classify common production LLM failures and give one mitigation for each.",
      "Prompt injection: isolate untrusted context and enforce hierarchy. Data leakage: code-level permissions and context minimization. Hallucination: grounding checks and abstention. Unsafe tool use: confirmation, validation, and least-privilege tools. Cost runaway: token/retry/tool-loop alerts.\nA strong answer maps each failure to a layer: model, retrieval, prompt, tool runtime, monitoring, or release process."
    )
  ]
};

export function addInterviewQuestions(topic: TopicModule): TopicModule {
  const questions = interviewQuestionBank[topic.slug] ?? [];

  return {
    ...topic,
    interviewQuestions: questions.map((question, index) => ({
      id: `${topic.slug}-interview-${index + 1}`,
      ...question
    }))
  };
}
