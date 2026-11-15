import { createClient } from "@/lib/supabase/server";
import type { Deudor, Movimiento, SaldoDeudor } from "@/lib/types";

export interface FiltrosDeudores {
  q?: string;
  cedula?: string;
  estado?: "todos" | "pendientes" | "pagados";
  desde?: string;
  hasta?: string;
}

export const POR_PAGINA = 20;

function rango(pagina: number): [number, number] {
  const desde = (Math.max(1, pagina) - 1) * POR_PAGINA;
  return [desde, desde + POR_PAGINA - 1];
}

export async function listDeudores(
  filtros: FiltrosDeudores,
  pagina = 1,
): Promise<{ filas: SaldoDeudor[]; total: number }> {
  const supabase = await createClient();
  let query = supabase.from("v_saldos").select("*", { count: "exact" });
  if (filtros.q) query = query.ilike("nombre", `%${filtros.q}%`);
  if (filtros.cedula) query = query.ilike("cedula", `%${filtros.cedula}%`);
  if (filtros.estado === "pendientes") query = query.gt("saldo", 0);
  if (filtros.estado === "pagados") query = query.lte("saldo", 0);
  if (filtros.desde) query = query.gte("creado_en", `${filtros.desde}T00:00:00`);
  if (filtros.hasta) query = query.lte("creado_en", `${filtros.hasta}T23:59:59.999`);
  query = query.order("saldo", { ascending: false }).range(...rango(pagina));
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { filas: (data ?? []) as SaldoDeudor[], total: count ?? 0 };
}

export async function getDeudor(id: string): Promise<Deudor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deudores")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Deudor | null) ?? null;
}

export async function getSaldoDeudor(id: string): Promise<SaldoDeudor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_saldos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SaldoDeudor | null) ?? null;
}

export async function listMovimientos(
  deudorId: string,
  pagina = 1,
): Promise<{ filas: Movimiento[]; total: number }> {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("movimientos")
    .select("*", { count: "exact" })
    .eq("deudor_id", deudorId)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .range(...rango(pagina));
  if (error) throw new Error(error.message);
  return { filas: (data ?? []) as Movimiento[], total: count ?? 0 };
}

export async function getDeudoresPendientesConMovimientos(): Promise<
  { deudor: SaldoDeudor; movimientos: Movimiento[] }[]
> {
  const supabase = await createClient();
  const { data: deudores, error: errorDeudores } = await supabase
    .from("v_saldos")
    .select("*")
    .gt("saldo", 0);
  if (errorDeudores) throw new Error(errorDeudores.message);
  const lista = (deudores ?? []) as SaldoDeudor[];
  if (lista.length === 0) return [];
  const ids = lista.map((d) => d.id);
  const { data: movimientos, error: errorMovs } = await supabase
    .from("movimientos")
    .select("*")
    .in("deudor_id", ids)
    .order("fecha", { ascending: true });
  if (errorMovs) throw new Error(errorMovs.message);
  const movs = (movimientos ?? []) as Movimiento[];
  return lista.map((deudor) => ({
    deudor,
    movimientos: movs.filter((m) => m.deudor_id === deudor.id),
  }));
}
