import { seedCurriculum } from "@/data/seedCurriculum";
import { HomeDashboard } from "@/components/study/HomeDashboard";

export default function HomePage() {
  return <HomeDashboard seedTopics={seedCurriculum} />;
}
