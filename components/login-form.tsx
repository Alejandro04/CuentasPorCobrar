"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import type { FormState } from "@/lib/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    login,
    undefined,
  );
  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
        />
        {state?.errors?.password && (
          <p className="text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
