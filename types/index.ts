export type ReviewRating = "forgot" | "weak" | "okay" | "strong" | "mastered";

export type StudyStage = "learn" | "explain" | "check" | "drill" | "review";

export type FigureKind =
  | "pipeline"
  | "tokenPrediction"
  | "lossCurve"
  | "trainingStep"
  | "ragFlow"
  | "inferenceLatency"
  | "kvCache"
  | "batchThroughput";

export type MathBlock = {
  title: string;
  formula: string;
  explanation: string;
};

export type FailureMode = {
  name: string;
  symptom: string;
  diagnosis: string;
  mitigation: string;
};

export type RecallQuestion = {
  id: string;
  prompt: string;
  answer: string;
};

export type PracticeDrill = {
  id: string;
  title: string;
  prompt: string;
  expected: string;
};

export type TopicModule = {
  slug: string;
  sequence: number;
  title: string;
  estimatedMinutes: number;
  summary: string;
  masteryPath: string[];
  overview: string[];
  deepLesson: string[];
  mathCore: MathBlock[];
  figures: FigureKind[];
  implementationNotes: string[];
  systemsNotes: string[];
  failureModes: FailureMode[];
  activeRecall: RecallQuestion[];
  practiceDrills: PracticeDrill[];
  memoryHooks: string[];
  checklist: string[];
  isSeed?: boolean;
};

export type RecallReview = {
  questionId: string;
  rating: ReviewRating;
  dueAt: string;
  lastReviewedAt: string;
};

export type MemoryAnswer = {
  questionId: string;
  text: string;
  updatedAt: string;
};

export type TopicProgress = {
  slug: string;
  stage: StudyStage;
  mastery: number;
  checklist: Record<string, boolean>;
  lastStudiedAt?: string;
};

export type DrillProgress = {
  drillId: string;
  solved: boolean;
  lastAttemptAt?: string;
};

export type StudyState = {
  version: 1;
  topicProgress: Record<string, TopicProgress>;
  recallReviews: Record<string, RecallReview>;
  memoryAnswers: Record<string, MemoryAnswer>;
  drillProgress: Record<string, DrillProgress>;
  customTopics: TopicModule[];
};
