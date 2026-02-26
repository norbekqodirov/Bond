import { OlympiadForm } from "@/components/admin/OlympiadForm";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";

export default function NewOlympiadPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">New Olympiad</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        New Olympiad
      </h1>
      <OlympiadForm />
    </div>
  );
}
