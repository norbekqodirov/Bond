"use client";

import { useFormState } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <div className="mx-auto w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage BOND content.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </label>
            <Input type="email" name="email" required placeholder="admin@bond.uz" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Password
            </label>
            <Input type="password" name="password" required />
          </div>

          {state.error ? (
            <p className="text-sm font-semibold text-rose-500">{state.error}</p>
          ) : null}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
