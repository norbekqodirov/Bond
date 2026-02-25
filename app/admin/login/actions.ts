"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? ""
  });

  if (!parsed.success) {
    return { error: "Invalid credentials." };
  }

  const { email, password } = parsed.data;
  if (!validateAdminCredentials(email, password)) {
    return { error: "Invalid credentials." };
  }

  setAdminSession(email);
  redirect("/admin");
}
