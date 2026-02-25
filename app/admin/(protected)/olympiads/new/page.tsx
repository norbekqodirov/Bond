import { OlympiadForm } from "@/components/admin/OlympiadForm";

export default function NewOlympiadPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        New Olympiad
      </h1>
      <OlympiadForm />
    </div>
  );
}
