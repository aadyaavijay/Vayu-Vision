import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/air-memory")({
  head: () => ({
    meta: [
      { title: "Air Memory — Vayu Vision" },
      { name: "description", content: "Calendar view of your respiratory history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="space-y-8">
      <PageHeader title="Air Memory™" subtitle="A quiet timeline of your breathing days — coming next." />
      <EmptyState
        title="Calendar view is being tuned"
        description="We're finalizing the month-at-a-glance visualization that pairs your symptoms with the air you breathed."
      />
    </div>
  ),
});
