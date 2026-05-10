"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Map,
  Route,
  RotateCcw
} from "lucide-react";
import { getTopicProgress } from "@/lib/storage";
import { topicHref } from "@/lib/routes";
import { isReviewDue } from "@/lib/spacedRepetition";
import type { RecallQuestion, StudyState, TopicModule } from "@/types";
import { ProgressRing } from "@/components/study/ProgressRing";
import { TopicEditor } from "@/components/study/TopicEditor";
import { useStudyState } from "@/components/study/useStudyState";

type HomeDashboardProps = {
  seedTopics: TopicModule[];
};

type DueReview = {
  topic: TopicModule;
  question: RecallQuestion;
  dueLabel: string;
};

function allTopics(seedTopics: TopicModule[], state: StudyState): TopicModule[] {
  return [...seedTopics, ...state.customTopics].sort((a, b) => a.sequence - b.sequence);
}

function masteryFor(topic: TopicModule, state: StudyState): number {
  return getTopicProgress(state, topic).mastery;
}

function getContinueTopic(topics: TopicModule[], state: StudyState): TopicModule {
  const studied = topics
    .map((topic) => ({
      topic,
      progress: state.topicProgress[topic.slug]
    }))
    .filter((item) => item.progress?.lastStudiedAt)
    .sort((a, b) => {
      const aTime = new Date(a.progress.lastStudiedAt ?? 0).getTime();
      const bTime = new Date(b.progress.lastStudiedAt ?? 0).getTime();
      return bTime - aTime;
    });

  return studied[0]?.topic ?? topics[0];
}

function getDueReviews(topics: TopicModule[], state: StudyState): DueReview[] {
  const due: DueReview[] = [];
  for (const topic of topics) {
    for (const question of topic.activeRecall) {
      const review = state.recallReviews[question.id];
      if (!review) {
        due.push({ topic, question, dueLabel: "new" });
        continue;
      }
      if (isReviewDue(review.dueAt) && ["forgot", "weak", "okay"].includes(review.rating)) {
        due.push({
          topic,
          question,
          dueLabel: review.rating
        });
      }
    }
  }
  return due.slice(0, 6);
}

export function HomeDashboard({ seedTopics }: HomeDashboardProps) {
  const { state, hydrated, updateState } = useStudyState();
  const topics = allTopics(seedTopics, state);
  const continueTopic = getContinueTopic(topics, state);
  const currentTopic =
    topics.find((topic) => masteryFor(topic, state) < 100) ?? topics[topics.length - 1];
  const dueReviews = hydrated ? getDueReviews(topics, state) : [];
  const practiceQueue = topics
    .flatMap((topic) =>
      topic.practiceDrills.map((drill) => ({
        topic,
        drill,
        solved: Boolean(state.drillProgress[drill.id]?.solved)
      }))
    )
    .filter((item) => !item.solved)
    .slice(0, 5);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-5 lg:px-8">
      <header className="flex items-center justify-between gap-3 py-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink">
            LLM Mastery
          </h1>
          <p className="mt-1 text-sm text-muted">
            Local-first lifecycle study: pretraining through production.
          </p>
        </div>
        <div className="hidden rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-muted sm:block">
          Private browser state
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Link
          className="panel panel-pad block transition hover:border-teal-500"
          href={topicHref(continueTopic.slug)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="section-title">Continue Learning</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-ink">
                {continueTopic.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-graphite">
                {continueTopic.summary}
              </p>
            </div>
            <ProgressRing value={masteryFor(continueTopic, state)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {continueTopic.masteryPath.slice(0, 3).map((item) => (
              <span
                className="max-w-full break-words rounded-md border border-line bg-wash px-2.5 py-1 text-xs font-medium text-graphite"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </Link>

        <section className="panel panel-pad">
          <div className="flex items-center gap-2">
            <Route size={18} className="text-teal-700" />
            <p className="section-title">Current Mastery Path</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-ink">{currentTopic.title}</h2>
          <ol className="mt-4 space-y-3">
            {currentTopic.masteryPath.map((item, index) => (
              <li className="flex gap-3 text-sm leading-6 text-graphite" key={item}>
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <section className="panel panel-pad">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <p className="section-title">Weak Concepts Due for Review</p>
          </div>
          <div className="mt-4 space-y-3">
            {dueReviews.length > 0 ? (
              dueReviews.map((item) => (
                <Link
                  className="block rounded-md border border-line bg-wash p-3 transition hover:border-teal-500"
                  href={topicHref(item.topic.slug, "active-recall")}
                  key={item.question.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      {item.topic.title}
                    </p>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                      {item.dueLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-graphite">{item.question.prompt}</p>
                </Link>
              ))
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted">
                No weak reviews are due. Grade recall answers to populate this queue.
              </p>
            )}
          </div>
        </section>

        <section className="panel panel-pad">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-teal-700" />
            <p className="section-title">Practice Queue</p>
          </div>
          <div className="mt-4 space-y-3">
            {practiceQueue.map((item) => (
              <Link
                className="block rounded-md border border-line bg-wash p-3 transition hover:border-teal-500"
                href={topicHref(item.topic.slug, "practice-drills")}
                key={item.drill.id}
              >
                <p className="text-sm font-semibold text-ink">{item.drill.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  {item.drill.prompt}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel panel-pad">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-teal-700" />
            <p className="section-title">Study Flow</p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-graphite">
            {["Learn", "Explain from memory", "Check understanding", "Solve drill", "Review weak point later"].map(
              (step, index) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-line bg-wash px-3 py-2"
                  key={step}
                >
                  <CheckCircle2 size={16} className={index === 0 ? "text-teal-700" : "text-muted"} />
                  {step}
                </div>
              )
            )}
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="panel panel-pad">
          <div className="flex items-center gap-2">
            <Map size={18} className="text-teal-700" />
            <p className="section-title">Curriculum Map</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {topics.map((topic) => (
              <Link
                className="group rounded-md border border-line bg-white p-3 transition hover:border-teal-500 hover:bg-teal-50"
                href={topicHref(topic.slug)}
                key={topic.slug}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Module {topic.sequence}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-ink">{topic.title}</h3>
                  </div>
                  <span className="rounded bg-wash px-2 py-1 text-xs font-semibold text-muted group-hover:bg-white">
                    {masteryFor(topic, state)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <TopicEditor state={state} updateState={updateState} />
      </section>
    </main>
  );
}
