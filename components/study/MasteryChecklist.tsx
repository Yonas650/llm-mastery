"use client";

import { toggleChecklistItem } from "@/lib/storage";
import type { StudyState, TopicModule } from "@/types";

type MasteryChecklistProps = {
  topic: TopicModule;
  state: StudyState;
  updateState: (updater: (current: StudyState) => StudyState) => void;
};

export function MasteryChecklist({ state, topic, updateState }: MasteryChecklistProps) {
  const checklist = state.topicProgress[topic.slug]?.checklist ?? {};

  return (
    <section className="panel panel-pad space-y-3">
      <div>
        <p className="section-title">Mastery Checklist</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Evidence before moving on</h2>
      </div>
      <div className="space-y-2">
        {topic.checklist.map((item) => (
          <label
            className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-wash p-3 text-sm leading-6 text-graphite"
            key={item}
          >
            <input
              checked={Boolean(checklist[item])}
              className="mt-1 h-4 w-4 accent-teal-700"
              onChange={() => updateState((current) => toggleChecklistItem(current, topic, item))}
              type="checkbox"
            />
            <span className={checklist[item] ? "text-muted line-through" : ""}>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
