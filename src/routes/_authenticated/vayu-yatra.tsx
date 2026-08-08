import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/vayu-yatra")({
  head: () => ({
    meta: [
      { title: "Vayu Yatra — Vayu Vision" },
      { name: "description", content: "Your personalized asthma trigger profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="space-y-8">
      <PageHeader title="Vayu Yatra" subtitle="Your personalized trigger fingerprint — arriving with a few more days of data." />
      <EmptyState
        title="Not enough signal yet"
        description="Log symptoms and doses for a week and Vayu Yatra will chart the triggers that matter most to you."
      />
    </div>
  ),
});
