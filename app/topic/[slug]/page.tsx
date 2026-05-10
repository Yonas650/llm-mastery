import { TopicPageClient } from "@/components/study/TopicPageClient";
import { seedCurriculum } from "@/data/seedCurriculum";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  return <TopicPageClient seedTopics={seedCurriculum} slug={slug} />;
}

export function generateStaticParams() {
  return seedCurriculum.map((topic) => ({
    slug: topic.slug
  }));
}
