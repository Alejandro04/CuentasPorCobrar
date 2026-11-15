"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deudorSchema, formErrors, type FormState } from "@/lib/types";

const enteroPositivo = /^\d+$/;

function leerDeudor(formData: FormData) {
  return deudorSchema.safeParse({
    nombre: formData.get("nombre"),
    cedula: formData.get("cedula"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    notas: formData.get("notas"),
  });
}

export async function crearDeudor(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parse = leerDeudor(formData);
  if (!parse.success) return { errors: formErrors(parse.error) };

  const montoRaw = String(formData.get("monto_inicial") ?? "").trim();
  const fechaInicial = String(formData.get("fecha_inicial") ?? "").trim();
  let montoInicial = 0;
  if (montoRaw) {
    if (!enteroPositivo.test(montoRaw) || Number(montoRaw) <= 0) {
      return { errors: { monto_inicial: ["Monto inválido (entero positivo)"] } };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicial)) {
      return {
        errors: { fecha_inicial: ["Selecciona la fecha de la deuda inicial"] },
      };
    }
    montoInicial = Number(montoRaw);
  }

  const supabase = await createClient();
  const { data: deudor, error } = await supabase
    .from("deudores")
    .insert({
      nombre: parse.data.nombre,
      cedula: parse.data.cedula,
      telefono: parse.data.telefono,
      direccion: parse.data.direccion,
      notas: parse.data.notas,
    })
    .select()
    .single();
  if (error) {
    return { message: "No se pudo guardar el deudor. Intenta de nuevo." };
  }

  if (montoInicial > 0) {
    const { error: errorMov } = await supabase.from("movimientos").insert({
      deudor_id: deudor.id,
      tipo: "cargo",
      monto: montoInicial,
      fecha: fechaInicial,
      nota: "Deuda inicial",
    });
    if (errorMov) {
      await supabase.from("deudores").delete().eq("id", deudor.id);
      return {
        message: "No se pudo registrar la deuda inicial. Intenta de nuevo.",
      };
    }
  }

  revalidatePath("/");
  redirect(`/deudores/${deudor.id}`);
}

export async function actualizarDeudor(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parse = leerDeudor(formData);
  if (!parse.success) return { errors: formErrors(parse.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("deudores")
    .update({
      nombre: parse.data.nombre,
      cedula: parse.data.cedula,
      telefono: parse.data.telefono,
      direccion: parse.data.direccion,
      notas: parse.data.notas,
    })
    .eq("id", id);
  if (error) return { message: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/");
  revalidatePath(`/deudores/${id}`);
  redirect(`/deudores/${id}`);
}

export async function eliminarDeudor(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("deudores").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar el deudor");
  revalidatePath("/");
  redirect("/");
}
