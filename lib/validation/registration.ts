import { z } from "zod";
import { grades, subjects } from "@/lib/enums";

export const registrationSchema = z.object({
  eventId: z.string().optional().nullable(),
  olympiadId: z.string().optional().nullable(),
  full_name: z.string().min(2, "Full name is required."),
  grade: z.enum(grades),
  subject: z.enum(subjects).optional().nullable().or(z.literal("")),
  phone: z.string().min(5, "Phone is required."),
  telegram: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  consent: z.literal("on")
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
