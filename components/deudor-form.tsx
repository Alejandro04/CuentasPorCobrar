"use client";

import Link from "next/link";
import { useActionState } from "react";
import { hoyIso } from "@/lib/antiguedad";
import type { Deudor, FormState } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none";
const labelCls = "text-sm font-medium text-zinc-700";

export function DeudorForm({
  action,
  deudor,
  conDeudaInicial = false,
  cancelHref = "/",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  deudor?: Pick<Deudor, "nombre" | "cedula" | "telefono" | "direccion" | "notas">;
  conDeudaInicial?: boolean;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const err = (campo: string) =>
    state?.errors?.[campo] ? (
      <p className="text-sm text-red-600">{state.errors[campo][0]}</p>
    ) : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className={labelCls}>
          Nombre *
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          defaultValue={deudor?.nombre ?? ""}
          className={inputCls}
        />
        {err("nombre")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cedula" className={labelCls}>
          Cédula
        </label>
        <input
          id="cedula"
          name="cedula"
          inputMode="numeric"
          defaultValue={deudor?.cedula ?? ""}
          className={inputCls}
        />
        {err("cedula")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="telefono" className={labelCls}>
          Teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          defaultValue={deudor?.telefono ?? ""}
          className={inputCls}
        />
        {err("telefono")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="direccion" className={labelCls}>
          Dirección
        </label>
        <input
          id="direccion"
          name="direccion"
          defaultValue={deudor?.direccion ?? ""}
          className={inputCls}
        />
        {err("direccion")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notas" className={labelCls}>
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          defaultValue={deudor?.notas ?? ""}
          className={inputCls}
        />
        {err("notas")}
      </div>

      {conDeudaInicial && (
        <fieldset className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4">
          <legend className="px-1 text-sm font-medium text-zinc-700">
            Deuda inicial (opcional)
          </legend>
          <div className="flex flex-col gap-1">
            <label htmlFor="monto_inicial" className={labelCls}>
              Monto (Pesos Colombianos)
            </label>
            <input
              id="monto_inicial"
              name="monto_inicial"
              type="number"
              min="1"
              step="1"
              className={inputCls}
            />
            {err("monto_inicial")}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="fecha_inicial" className={labelCls}>
              Fecha
            </label>
            <input
              id="fecha_inicial"
              name="fecha_inicial"
              type="date"
              defaultValue={hoyIso()}
              className={inputCls}
            />
            {err("fecha_inicial")}
          </div>
        </fieldset>
      )}

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
