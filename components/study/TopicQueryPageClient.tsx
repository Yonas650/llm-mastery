"use client";

import { useSearchParams } from "next/navigation";
import { TopicPageClient } from "@/components/study/TopicPageClient";
import type { TopicModule } from "@/types";

type TopicQueryPageClientProps = {
  seedTopics: TopicModule[];
};

export function TopicQueryPageClient({ seedTopics }: TopicQueryPageClientProps) {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "llm-pretraining";

  return <TopicPageClient seedTopics={seedTopics} slug={slug} />;
}
