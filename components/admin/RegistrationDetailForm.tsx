"use client";

import { useFormState } from "react-dom";
import type { Registration } from "@prisma/client";
import { registrationStatuses } from "@/lib/enums";
import { updateRegistration, type RegistrationFormState } from "@/app/admin/(protected)/registrations/actions";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: RegistrationFormState = {};

export function RegistrationDetailForm({
  registration
}: {
  registration: Registration;
}) {
  const action = updateRegistration.bind(null, registration.id);
  const [state, formAction] = useFormState(action, initialState);
  const safeState = state ?? initialState;

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Status
        </label>
        <Select name="status" defaultValue={registration.status}>
          {registrationStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Admin Note
        </label>
        <Textarea name="admin_note" defaultValue={registration.admin_note ?? ""} />
      </div>

      {safeState.error ? (
        <p className="text-sm font-semibold text-rose-500">{safeState.error}</p>
      ) : null}

      <button
        type="submit"
        className="rounded-full bg-brand-primary px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-soft"
      >
        Update
      </button>
    </form>
  );
}
