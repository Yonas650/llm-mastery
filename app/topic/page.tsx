import { Suspense } from "react";
import { TopicQueryPageClient } from "@/components/study/TopicQueryPageClient";
import { seedCurriculum } from "@/data/seedCurriculum";

export default function TopicQueryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen max-w-4xl px-3 py-6">
          <div className="panel panel-pad text-sm text-muted">Loading topic...</div>
        </main>
      }
    >
      <TopicQueryPageClient seedTopics={seedCurriculum} />
    </Suspense>
  );
}
