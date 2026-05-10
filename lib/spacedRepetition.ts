import type { ReviewRating } from "@/types";

export const REVIEW_INTERVAL_DAYS: Record<ReviewRating, number> = {
  forgot: 0,
  weak: 1,
  okay: 3,
  strong: 7,
  mastered: 21
};

export function nextReviewDate(rating: ReviewRating, from = new Date()): Date {
  const due = new Date(from);
  due.setHours(9, 0, 0, 0);
  due.setDate(due.getDate() + REVIEW_INTERVAL_DAYS[rating]);
  return due;
}

export function isReviewDue(dueAt: string, now = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime();
}

export function ratingLabel(rating: ReviewRating): string {
  switch (rating) {
    case "forgot":
      return "Forgot";
    case "weak":
      return "Weak";
    case "okay":
      return "Okay";
    case "strong":
      return "Strong";
    case "mastered":
      return "Mastered";
  }
}
