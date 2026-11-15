export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number): string => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((fila) => fila.map(escape).join(",")).join("\n");
}
