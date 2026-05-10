"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addOrUpdateCustomTopic, deleteCustomTopic, slugify } from "@/lib/storage";
import type { StudyState, TopicModule } from "@/types";

type TopicEditorProps = {
  state: StudyState;
  updateState: (updater: (current: StudyState) => StudyState) => void;
};

function makeCustomTopic(title: string, summary: string): TopicModule {
  const slug = slugify(title);
  return {
    slug,
    sequence: 1000 + Date.now(),
    title,
    estimatedMinutes: 30,
    summary,
    masteryPath: [
      "Define the exact lifecycle component.",
      "Write one metric that proves progress.",
      "Create one recall prompt and one diagnostic drill."
    ],
    overview: [
      summary,
      "This private module is local to this browser. Use it for focused LLM lifecycle concepts that need extra repetition."
    ],
    deepLesson: [
      "Replace this draft with direct technical explanation: mechanism, inputs, outputs, optimization target, systems constraints, and failure modes.",
      "Keep it connected to the LLM lifecycle. Avoid generic programming notes unless they directly affect training, retrieval, evaluation, inference, deployment, or agents."
    ],
    mathCore: [
      {
        title: "Component metric",
        formula: "m = \\frac{\\text{measured behavior}}{\\text{target behavior}}",
        explanation:
          "Edit this into the real equation, diagnostic, or accounting identity that governs the concept."
      }
    ],
    figures: ["pipeline"],
    implementationNotes: [
      "Add concrete implementation notes: data shape, API contract, evaluation hook, or serving constraint."
    ],
    systemsNotes: [
      "Add systems notes: memory, latency, throughput, observability, rollback, or cost."
    ],
    failureModes: [
      {
        name: "Unspecified failure",
        symptom: "The behavior degrades but the reason is unclear.",
        diagnosis: "The module needs a more specific diagnostic.",
        mitigation: "Edit the topic with a concrete failure mode and measurement."
      }
    ],
    activeRecall: [
      {
        id: `${slug}-custom-recall-1`,
        prompt: `Explain ${title} from memory in one precise paragraph.`,
        answer:
          "A strong answer names the mechanism, why it matters, the main metric, and one failure mode."
      }
    ],
    practiceDrills: [
      {
        id: `${slug}-custom-drill-1`,
        title: "Diagnostic drill",
        prompt:
          "Create a realistic symptom for this concept, then identify the component-level root cause.",
        expected:
          "A good solution states the symptom, candidate root cause, and evidence needed to verify it."
      }
    ],
    memoryHooks: ["If the metric is vague, the mastery target is vague."],
    checklist: [
      "I replaced the draft with a precise technical explanation.",
      "I added at least one real failure mode.",
      "I can answer the recall prompt without reading."
    ]
  };
}

export function TopicEditor({ state, updateState }: TopicEditorProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const canSave = useMemo(
    () => title.trim().length > 2 && summary.trim().length > 12 && Boolean(slugify(title)),
    [summary, title]
  );

  return (
    <section className="panel panel-pad space-y-4">
      <div>
        <p className="section-title">Add/Edit Topic</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Private lifecycle module</h2>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-graphite">
          Topic title
          <input
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Long-context eval failures"
          />
        </label>
        <label className="block text-sm font-medium text-graphite">
          Technical focus
          <textarea
            className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 text-ink"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Define what this concept controls in the LLM lifecycle."
          />
        </label>
        <button
          className="primary-button w-full sm:w-auto"
          disabled={!canSave}
          onClick={() => {
            const topic = makeCustomTopic(title.trim(), summary.trim());
            updateState((current) => addOrUpdateCustomTopic(current, topic));
            setTitle("");
            setSummary("");
          }}
          type="button"
        >
          <Plus size={16} />
          Save local topic
        </button>
      </div>

      {state.customTopics.length > 0 ? (
        <div className="space-y-2 border-t border-line pt-3">
          {state.customTopics.map((topic) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-wash px-3 py-2"
              key={topic.slug}
            >
              <div>
                <p className="text-sm font-semibold text-ink">{topic.title}</p>
                <p className="line-clamp-1 text-xs text-muted">{topic.summary}</p>
              </div>
              <button
                aria-label={`Delete ${topic.title}`}
                className="control-button px-2"
                onClick={() => updateState((current) => deleteCustomTopic(current, topic.slug))}
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
