"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";

const initial: AuthState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue="alice@ajaia.dev"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-base font-normal text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue="demo1234"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-base font-normal text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-2"
        />
      </label>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <SubmitButton className="mt-1 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        Sign in
      </SubmitButton>
    </form>
  );
}
