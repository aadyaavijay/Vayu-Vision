import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Vayu Vision" },
      { name: "description", content: "Long-term respiratory trends and insights." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="space-y-8">
      <PageHeader title="Analytics" subtitle="Long-term patterns — coming with your next month of data." />
      <EmptyState
        title="Analytics warm-up"
        description="Once you have a few weeks of history, this view unlocks trigger correlations, adherence streaks, and seasonal patterns."
      />
    </div>
  ),
});
