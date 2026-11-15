import { calcularAntiguedad, mesesTranscurridos } from "@/lib/antiguedad";
import type { Movimiento, SaldoDeudor } from "@/lib/types";

export interface FilaAntiguedad {
  nombre: string;
  telefono: string | null;
  saldo: number;
  fechaDeuda: string;
  meses: number;
}

export function construirReporte(
  grupos: { deudor: SaldoDeudor; movimientos: Movimiento[] }[],
  mesesMin: number,
  hoy: string,
): FilaAntiguedad[] {
  const filas: FilaAntiguedad[] = [];
  for (const { deudor, movimientos } of grupos) {
    if (deudor.saldo <= 0) continue;
    const cargos = movimientos
      .filter((m) => m.tipo === "cargo")
      .map((m) => ({ fecha: m.fecha.slice(0, 10), monto: m.monto }));
    const abonos = movimientos
      .filter((m) => m.tipo === "abono")
      .map((m) => ({ fecha: m.fecha.slice(0, 10), monto: m.monto }));
    const fechaDeuda = calcularAntiguedad(cargos, abonos);
    if (!fechaDeuda) continue;
    const meses = mesesTranscurridos(fechaDeuda, hoy);
    if (meses < mesesMin) continue;
    filas.push({
      nombre: deudor.nombre,
      telefono: deudor.telefono,
      saldo: deudor.saldo,
      fechaDeuda,
      meses,
    });
  }
  return filas.sort((a, b) => a.fechaDeuda.localeCompare(b.fechaDeuda));
}
