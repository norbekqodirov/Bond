"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registrationStatuses } from "@/lib/enums";

const updateSchema = z.object({
  status: z.enum(registrationStatuses),
  admin_note: z.string().optional().nullable()
});

export type RegistrationFormState = {
  error?: string;
};

export async function updateRegistration(
  id: string,
  _prevState: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  const payload = Object.fromEntries(formData.entries());
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please fill required fields." };
  }

  const data = parsed.data;
  await prisma.registration.update({
    where: { id },
    data: {
      status: data.status,
      admin_note: data.admin_note || null
    }
  });

  redirect(`/admin/registrations/${id}`);
}
