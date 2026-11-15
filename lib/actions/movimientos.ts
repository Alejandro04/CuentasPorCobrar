"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formErrors, movimientoSchema, type FormState } from "@/lib/types";

async function saldoActual(deudorId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_saldos")
    .select("saldo")
    .eq("id", deudorId)
    .single();
  if (error) throw new Error(error.message);
  return Number(data.saldo);
}

function parsear(formData: FormData) {
  return movimientoSchema.safeParse({
    tipo: formData.get("tipo"),
    monto: formData.get("monto"),
    fecha: formData.get("fecha"),
    nota: formData.get("nota"),
  });
}

export async function crearMovimiento(
  deudorId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parse = parsear(formData);
  if (!parse.success) return { errors: formErrors(parse.error) };

  if (parse.data.tipo === "abono") {
    const saldo = await saldoActual(deudorId);
    if (parse.data.monto > saldo) {
      return {
        errors: {
          monto: [`El abono no puede superar el saldo actual ($ ${saldo})`],
        },
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("movimientos").insert({
    deudor_id: deudorId,
    tipo: parse.data.tipo,
    monto: parse.data.monto,
    fecha: parse.data.fecha,
    nota: parse.data.nota,
  });
  if (error) {
    return { message: "No se pudo guardar el movimiento. Intenta de nuevo." };
  }

  revalidatePath(`/deudores/${deudorId}`);
  revalidatePath("/");
  return {};
}

export async function actualizarMovimiento(
  movimientoId: string,
  deudorId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parse = parsear(formData);
  if (!parse.success) return { errors: formErrors(parse.error) };

  const supabase = await createClient();
  if (parse.data.tipo === "abono") {
    // Saldo disponible excluyendo este mismo movimiento
    const { data: propio, error: errorPropio } = await supabase
      .from("movimientos")
      .select("monto, tipo")
      .eq("id", movimientoId)
      .single();
    if (errorPropio) return { message: "No se pudo leer el movimiento." };
    const saldo = await saldoActual(deudorId);
    const saldoSinEste =
      propio.tipo === "abono" ? saldo + Number(propio.monto) : saldo;
    if (parse.data.monto > saldoSinEste) {
      return {
        errors: {
          monto: [
            `El abono no puede superar el saldo disponible ($ ${saldoSinEste})`,
          ],
        },
      };
    }
  }

  const { error } = await supabase
    .from("movimientos")
    .update({
      tipo: parse.data.tipo,
      monto: parse.data.monto,
      fecha: parse.data.fecha,
      nota: parse.data.nota,
    })
    .eq("id", movimientoId);
  if (error) return { message: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath(`/deudores/${deudorId}`);
  revalidatePath("/");
  return {};
}

export async function eliminarMovimiento(
  movimientoId: string,
  deudorId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("movimientos")
    .delete()
    .eq("id", movimientoId);
  if (error) throw new Error("No se pudo eliminar el movimiento");
  revalidatePath(`/deudores/${deudorId}`);
  revalidatePath("/");
}
