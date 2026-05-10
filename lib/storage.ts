"use client";

import { nextReviewDate } from "@/lib/spacedRepetition";
import type {
  DrillProgress,
  MemoryAnswer,
  RecallReview,
  ReviewRating,
  StudyStage,
  StudyState,
  TopicModule,
  TopicProgress
} from "@/types";

const STORAGE_KEY = "llm-mastery.study.v1";

export const emptyStudyState: StudyState = {
  version: 1,
  topicProgress: {},
  recallReviews: {},
  memoryAnswers: {},
  drillProgress: {},
  customTopics: []
};

function isStudyState(value: unknown): value is StudyState {
  if (!value || typeof value !== "object") {
    return false;
  }
  return (value as StudyState).version === 1;
}

export function loadStudyState(): StudyState {
  if (typeof window === "undefined") {
    return emptyStudyState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStudyState;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isStudyState(parsed)) {
      return emptyStudyState;
    }
    return {
      ...emptyStudyState,
      ...parsed,
      topicProgress: parsed.topicProgress ?? {},
      recallReviews: parsed.recallReviews ?? {},
      memoryAnswers: parsed.memoryAnswers ?? {},
      drillProgress: parsed.drillProgress ?? {},
      customTopics: parsed.customTopics ?? []
    };
  } catch {
    return emptyStudyState;
  }
}

export function saveStudyState(state: StudyState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getTopicProgress(state: StudyState, topic: TopicModule): TopicProgress {
  return (
    state.topicProgress[topic.slug] ?? {
      slug: topic.slug,
      stage: "learn",
      mastery: 0,
      checklist: {}
    }
  );
}

export function computeTopicMastery(topic: TopicModule, progress: TopicProgress): number {
  const total = topic.checklist.length;
  if (total === 0) {
    return progress.mastery;
  }
  const complete = topic.checklist.filter((item) => progress.checklist[item]).length;
  return Math.round((complete / total) * 100);
}

export function updateTopicStage(state: StudyState, slug: string, stage: StudyStage): StudyState {
  const current = state.topicProgress[slug] ?? {
    slug,
    stage: "learn",
    mastery: 0,
    checklist: {}
  };

  return {
    ...state,
    topicProgress: {
      ...state.topicProgress,
      [slug]: {
        ...current,
        stage,
        lastStudiedAt: new Date().toISOString()
      }
    }
  };
}

export function toggleChecklistItem(
  state: StudyState,
  topic: TopicModule,
  item: string
): StudyState {
  const current = getTopicProgress(state, topic);
  const checklist = {
    ...current.checklist,
    [item]: !current.checklist[item]
  };
  const nextProgress = {
    ...current,
    checklist,
    lastStudiedAt: new Date().toISOString()
  };

  return {
    ...state,
    topicProgress: {
      ...state.topicProgress,
      [topic.slug]: {
        ...nextProgress,
        mastery: computeTopicMastery(topic, nextProgress)
      }
    }
  };
}

export function recordRecallRating(
  state: StudyState,
  questionId: string,
  rating: ReviewRating
): StudyState {
  const now = new Date();
  const review: RecallReview = {
    questionId,
    rating,
    dueAt: nextReviewDate(rating, now).toISOString(),
    lastReviewedAt: now.toISOString()
  };

  return {
    ...state,
    recallReviews: {
      ...state.recallReviews,
      [questionId]: review
    }
  };
}

export function recordMemoryAnswer(
  state: StudyState,
  questionId: string,
  text: string
): StudyState {
  const answer: MemoryAnswer = {
    questionId,
    text,
    updatedAt: new Date().toISOString()
  };

  return {
    ...state,
    memoryAnswers: {
      ...state.memoryAnswers,
      [questionId]: answer
    }
  };
}

export function markDrillSolved(state: StudyState, drillId: string): StudyState {
  const progress: DrillProgress = {
    drillId,
    solved: true,
    lastAttemptAt: new Date().toISOString()
  };
  return {
    ...state,
    drillProgress: {
      ...state.drillProgress,
      [drillId]: progress
    }
  };
}

export function addOrUpdateCustomTopic(state: StudyState, topic: TopicModule): StudyState {
  const existing = state.customTopics.filter((candidate) => candidate.slug !== topic.slug);
  return {
    ...state,
    customTopics: [...existing, topic]
  };
}

export function deleteCustomTopic(state: StudyState, slug: string): StudyState {
  return {
    ...state,
    customTopics: state.customTopics.filter((topic) => topic.slug !== slug)
  };
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
