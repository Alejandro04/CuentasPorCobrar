"use client";

import { useActionState, useEffect, useRef } from "react";
import { hoyIso } from "@/lib/antiguedad";
import type { FormState, Movimiento } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none";

export function MovimientoForm({
  action,
  tipo,
  movimiento,
  onDone,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  tipo: "cargo" | "abono";
  movimiento?: Pick<Movimiento, "monto" | "fecha" | "nota" | "tipo">;
  onDone?: () => void;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const primerRender = useRef(true);

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    // Guardado exitoso: state definido y sin errores ni mensaje
    if (state && !state.errors && !state.message) {
      if (onDone) onDone();
      else formRef.current?.reset();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="tipo" value={movimiento?.tipo ?? tipo} />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-zinc-700">Monto (Pesos Colombianos) *</label>
          <input
            name="monto"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={movimiento?.monto ?? ""}
            className={inputCls}
          />
          {state?.errors?.monto && (
            <p className="text-sm text-red-600">{state.errors.monto[0]}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-zinc-700">Fecha *</label>
          <input
            name="fecha"
            type="date"
            required
            defaultValue={(movimiento?.fecha ?? hoyIso()).slice(0, 10)}
            className={inputCls}
          />
          {state?.errors?.fecha && (
            <p className="text-sm text-red-600">{state.errors.fecha[0]}</p>
          )}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-700">Nota</label>
        <input
          name="nota"
          defaultValue={movimiento?.nota ?? ""}
          className={inputCls}
        />
      </div>
      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Guardando..." : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
