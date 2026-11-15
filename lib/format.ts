export function formatCOP(monto: number): string {
  const entero = Math.round(monto);
  const positivo = Math.abs(entero)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${entero < 0 ? "-" : ""}${positivo}`;
}

export function formatFecha(fechaIso: string): string {
  const [y, m, d] = fechaIso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
