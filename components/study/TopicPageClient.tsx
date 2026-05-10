"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BookOpen, Cpu, FlaskConical, ShieldAlert, Sigma } from "lucide-react";
import { getTopicProgress } from "@/lib/storage";
import type { TopicModule } from "@/types";
import { InteractiveFigure } from "@/components/figures/InteractiveFigure";
import { ActiveRecallPanel } from "@/components/study/ActiveRecallPanel";
import { MathEquation } from "@/components/study/MathEquation";
import { MasteryChecklist } from "@/components/study/MasteryChecklist";
import { PracticeDrills } from "@/components/study/PracticeDrills";
import { ProgressRing } from "@/components/study/ProgressRing";
import { StudyFlowControls } from "@/components/study/StudyFlowControls";
import { useStudyState } from "@/components/study/useStudyState";

type TopicPageClientProps = {
  seedTopics: TopicModule[];
  slug: string;
};

function findTopic(seedTopics: TopicModule[], customTopics: TopicModule[], slug: string) {
  return [...seedTopics, ...customTopics].find((topic) => topic.slug === slug);
}

function TextSection({
  title,
  tone = "default",
  children
}: {
  title: string;
  tone?: "default" | "lesson";
  children: ReactNode;
}) {
  return (
    <section className={`lesson-card ${tone === "lesson" ? "lesson-card-reading" : ""}`}>
      <p className="section-title">{title}</p>
      {children}
    </section>
  );
}

export function TopicPageClient({ seedTopics, slug }: TopicPageClientProps) {
  const { state, hydrated, updateState } = useStudyState();
  const topic = findTopic(seedTopics, state.customTopics, slug);

  if (!topic && !hydrated) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-3 py-6">
        <div className="panel panel-pad text-sm text-muted">Loading local topic...</div>
      </main>
    );
  }

  if (!topic) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-3 py-6">
        <section className="panel panel-pad">
          <h1 className="text-2xl font-semibold text-ink">Topic not found</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            This topic is not in the seed curriculum or local browser storage.
          </p>
          <Link className="primary-button mt-4" href="/">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const progress = getTopicProgress(state, topic);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-3 py-4 sm:px-5 lg:px-8">
      <Link className="control-button w-fit" href="/">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <header className="panel panel-pad">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="section-title">Module {topic.sequence}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.015em] text-ink">
              {topic.title}
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-graphite">
              {topic.summary}
            </p>
          </div>
          <ProgressRing value={progress.mastery} size={60} />
        </div>
        <div className="mt-5">
          <StudyFlowControls
            currentStage={progress.stage}
            slug={topic.slug}
            updateState={updateState}
          />
        </div>
      </header>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <div className="min-w-0 space-y-4">
          <TextSection title="Overview" tone="lesson">
            <div className="space-y-4">
              {topic.overview.map((paragraph) => (
                <p className="body-copy" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </TextSection>

          <TextSection title="Deep Lesson" tone="lesson">
            <div className="space-y-4">
              {topic.deepLesson.map((paragraph, index) => (
                <div className="flex gap-3" key={paragraph}>
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">
                    {index + 1}
                  </span>
                  <p className="body-copy">{paragraph}</p>
                </div>
              ))}
            </div>
          </TextSection>

          <TextSection title="Math Core">
            <div className="space-y-3">
              {topic.mathCore.map((block, index) => (
                <article className="math-card" key={block.title}>
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">
                      {index + 1}
                    </span>
                    <Sigma size={17} className="text-teal-700" />
                    <h3 className="text-base font-semibold text-ink">{block.title}</h3>
                  </div>
                  <MathEquation expression={block.formula} />
                  <p className="mt-3 text-sm leading-6 text-graphite">{block.explanation}</p>
                </article>
              ))}
            </div>
          </TextSection>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={18} className="text-teal-700" />
              <p className="section-title">Interactive Figure</p>
            </div>
            {topic.figures.map((figure) => (
              <InteractiveFigure kind={figure} key={figure} />
            ))}
          </section>

          <TextSection title="Implementation Notes">
            <ul className="technical-list">
              {topic.implementationNotes.map((note) => (
                <li className="flex gap-3" key={note}>
                  <BookOpen size={17} className="mt-1 shrink-0 text-teal-700" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </TextSection>

          <TextSection title="Systems Notes">
            <ul className="technical-list">
              {topic.systemsNotes.map((note) => (
                <li className="flex gap-3" key={note}>
                  <Cpu size={17} className="mt-1 shrink-0 text-teal-700" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </TextSection>

          <TextSection title="Failure Modes">
            <div className="space-y-3">
              {topic.failureModes.map((failure) => (
                <article className="rounded-md border border-line bg-wash p-4" key={failure.name}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={17} className="text-amber-500" />
                    <h3 className="text-base font-semibold text-ink">{failure.name}</h3>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm leading-6 text-graphite">
                    <div>
                      <dt className="font-semibold text-ink">Symptom</dt>
                      <dd>{failure.symptom}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Diagnosis</dt>
                      <dd>{failure.diagnosis}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Mitigation</dt>
                      <dd>{failure.mitigation}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </TextSection>

          <ActiveRecallPanel
            questions={topic.activeRecall}
            state={state}
            updateState={updateState}
          />

          <PracticeDrills
            drills={topic.practiceDrills}
            state={state}
            updateState={updateState}
          />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <TextSection title="Memory Hooks">
            <ul className="space-y-3 text-sm leading-6 text-graphite">
              {topic.memoryHooks.map((hook) => (
                <li className="rounded-md border border-line bg-wash p-3" key={hook}>
                  {hook}
                </li>
              ))}
            </ul>
          </TextSection>
          <MasteryChecklist topic={topic} state={state} updateState={updateState} />
        </aside>
      </section>
    </main>
  );
}
