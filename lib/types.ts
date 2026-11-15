import { z } from "zod";

export type TipoMovimiento = "cargo" | "abono";

export interface Deudor {
  id: string;
  nombre: string;
  cedula: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  creado_en: string;
}

export interface Movimiento {
  id: string;
  deudor_id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  nota: string | null;
  creado_en: string;
}

export interface SaldoDeudor extends Deudor {
  total_cargos: number;
  total_abonos: number;
  saldo: number;
  fecha_ultimo_movimiento: string | null;
}

export type FormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : null));

export const deudorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: "El nombre es obligatorio" })
    .max(120, { error: "Máximo 120 caracteres" }),
  cedula: textoOpcional(30),
  telefono: textoOpcional(30),
  direccion: textoOpcional(200),
  notas: textoOpcional(2000),
});

export const movimientoSchema = z.object({
  tipo: z.enum(["cargo", "abono"]),
  monto: z.coerce
    .number({ error: "Monto inválido" })
    .int({ error: "El monto debe ser un número entero" })
    .positive({ error: "El monto debe ser mayor que cero" }),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Fecha inválida (usa AAAA-MM-DD)" }),
  nota: textoOpcional(500),
});

export function formErrors(error: z.ZodError): Record<string, string[]> {
  const salida: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const clave = String(issue.path[0] ?? "_");
    (salida[clave] ??= []).push(issue.message);
  }
  return salida;
}
