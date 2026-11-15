"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { MovimientoForm } from "@/components/movimiento-form";
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
} from "@/lib/actions/movimientos";
import { formatCOP, formatFecha } from "@/lib/format";
import type { FormState, Movimiento } from "@/lib/types";

function NuevoMovimientoPanel({
  deudorId,
  tipo,
  onDone,
}: {
  deudorId: string;
  tipo: "cargo" | "abono";
  onDone: () => void;
}) {
  const action = async (
    prev: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    formData.set("tipo", tipo);
    return crearMovimiento(deudorId, prev, formData);
  };
  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-zinc-800">
        {tipo === "cargo" ? "Nuevo cargo" : "Nuevo abono"}
      </h3>
      <MovimientoForm
        action={action}
        tipo={tipo}
        onDone={onDone}
        submitLabel="Guardar"
      />
    </div>
  );
}

export function FichaMovimientos({
  deudorId,
  movimientos,
  total,
}: {
  deudorId: string;
  movimientos: Movimiento[];
  total: number;
}) {
  const [mostrarForm, setMostrarForm] = useState<"cargo" | "abono" | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-zinc-900">
          Historial ({total})
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMostrarForm(mostrarForm === "cargo" ? null : "cargo")}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Registrar cargo
          </button>
          <button
            type="button"
            onClick={() => setMostrarForm(mostrarForm === "abono" ? null : "abono")}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Registrar abono
          </button>
        </div>
      </div>

      {mostrarForm && (
        <NuevoMovimientoPanel
          deudorId={deudorId}
          tipo={mostrarForm}
          onDone={() => setMostrarForm(null)}
        />
      )}

      {movimientos.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Sin movimientos todavía.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {movimientos.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            >
              {editando === m.id ? (
                <MovimientoForm
                  action={actualizarMovimiento.bind(null, m.id, deudorId)}
                  tipo={m.tipo}
                  movimiento={m}
                  onDone={() => setEditando(null)}
                  submitLabel="Guardar cambios"
                />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm text-zinc-700">
                    <span
                      className={
                        m.tipo === "cargo" ? "text-red-600" : "text-emerald-600"
                      }
                    >
                      {m.tipo === "cargo" ? "Cargo" : "Abono"}
                    </span>
                    {" · "}
                    {formatFecha(m.fecha)}
                    {m.nota && <span className="text-zinc-400"> · {m.nota}</span>}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <p
                      className={`font-medium ${
                        m.tipo === "cargo" ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {m.tipo === "cargo" ? "+" : "−"} {formatCOP(m.monto)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditando(m.id)}
                      className="no-print text-xs text-zinc-500 hover:underline"
                    >
                      Editar
                    </button>
                    <ConfirmButton
                      action={eliminarMovimiento.bind(null, m.id, deudorId)}
                      label="Eliminar"
                      confirmText="¿Eliminar este movimiento? El saldo se recalculará."
                      className="no-print text-xs text-red-500 hover:underline"
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
