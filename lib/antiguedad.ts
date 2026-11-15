export interface MovimientoFecha {
  fecha: string;
  monto: number;
}

export function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Antigüedad FIFO: los abonos se aplican a los cargos más antiguos primero.
// Devuelve la fecha del cargo más antiguo con saldo pendiente, o null si está saldado.
export function calcularAntiguedad(
  cargos: MovimientoFecha[],
  abonos: MovimientoFecha[],
): string | null {
  const totalAbonos = abonos.reduce((suma, a) => suma + a.monto, 0);
  const ordenados = [...cargos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  let acumulado = 0;
  for (const cargo of ordenados) {
    acumulado += cargo.monto;
    if (acumulado > totalAbonos) return cargo.fecha;
  }
  return null;
}

// Meses completos (truncados) entre dos fechas ISO 'YYYY-MM-DD'
export function mesesTranscurridos(desde: string, hoy: string): number {
  const [dy, dm, dd] = desde.split("-").map(Number);
  const [hy, hm, hd] = hoy.split("-").map(Number);
  let meses = (hy - dy) * 12 + (hm - dm);
  if (hd < dd) meses -= 1;
  return Math.max(0, meses);
}
