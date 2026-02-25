"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/server";
import { registrationSchema } from "@/lib/validation/registration";

export type RegistrationState = {
  ok: boolean;
  message?: string;
};

export async function submitRegistration(
  _prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const payload = {
    eventId: formData.get("eventId")?.toString() || null,
    olympiadId: formData.get("olympiadId")?.toString() || null,
    full_name: formData.get("full_name")?.toString() || "",
    grade: formData.get("grade")?.toString() || "",
    subject: formData.get("subject")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    telegram: formData.get("telegram")?.toString() || null,
    email: formData.get("email")?.toString() || null,
    consent: formData.get("consent")?.toString() || ""
  };

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "validation" };
  }

  const data = parsed.data;

  let eventId: string | null = data.eventId ?? null;
  let olympiadId: string | null = data.olympiadId ?? null;
  let subject = data.subject || null;

  if (!olympiadId && !eventId) {
    const fallbackEvent = await prisma.event.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" }
    });
    eventId = fallbackEvent?.id ?? null;
  }

  if (!olympiadId && !eventId) {
    return { ok: false, message: "validation" };
  }

  const [event, olympiad] = await Promise.all([
    eventId ? prisma.event.findUnique({ where: { id: eventId } }) : Promise.resolve(null),
    olympiadId ? prisma.olympiad.findUnique({ where: { id: olympiadId } }) : Promise.resolve(null)
  ]);

  if (eventId && !event) {
    return { ok: false, message: "validation" };
  }
  if (olympiadId && !olympiad) {
    return { ok: false, message: "validation" };
  }

  if (olympiad) {
    subject = olympiad.subject ?? subject;
  }

  if (event?.subjects?.length) {
    if (!subject || !event.subjects.includes(subject)) {
      return { ok: false, message: "validation" };
    }
  }

  const session = await getServerSession();

  await prisma.registration.create({
    data: {
      eventId,
      olympiadId,
      userId: session?.user?.id ?? null,
      participantName: data.full_name,
      phone: data.phone,
      subject,
      formData: {
        grade: data.grade
      },
      status: "NEW",
      paymentStatus: "UNPAID"
    }
  });

  return { ok: true, message: "Submitted (demo). We will contact you." };
}
