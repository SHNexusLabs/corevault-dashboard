import { Construction } from "lucide-react";

export default async function AdminMigrationPlaceholder({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const title = slug.map((part) => part.replaceAll("-", " ")).join(" / ");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="min-h-105 rounded-xl border border-border bg-surface-card flex flex-col items-center justify-center text-center p-8">
        <div className="w-12 h-12 rounded-xl bg-brand-muted border border-brand/20 flex items-center justify-center mb-4">
          <Construction className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-lg font-semibold text-text capitalize">{title}</h2>
        <p className="text-sm text-text-muted mt-2 max-w-md">
          Route is ready. This screen is queued for migration from the
          React/Figma dashboard.
        </p>
      </div>
    </div>
  );
}
