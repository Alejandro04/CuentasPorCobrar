import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { hoyIso } from "@/lib/antiguedad";
import { formatCOP, formatFecha } from "@/lib/format";
import { getDeudoresPendientesConMovimientos } from "@/lib/queries";
import { construirReporte } from "@/lib/reporte";

export default async function ReporteAntiguedadPage({
  searchParams,
}: {
  searchParams: Promise<{ meses?: string | string[] }>;
}) {
  const sp = await searchParams;
  const mesesRaw = Array.isArray(sp.meses) ? sp.meses[0] : sp.meses;
  const mesesMin = mesesRaw === "6" ? 6 : 3;
  const hoy = hoyIso();

  const grupos = await getDeudoresPendientesConMovimientos();
  const filas = construirReporte(grupos, mesesMin, hoy);
  const totalAdeudado = filas.reduce((suma, f) => suma + f.saldo, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">
          Deudores con antigÃ¼edad de {mesesMin} meses o mÃ¡s
        </h1>
        <div className="no-print flex items-center gap-2">
          <Link
            href={`/reportes/antiguedad?meses=${mesesMin === 3 ? 6 : 3}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Ver {mesesMin === 3 ? "6" : "3"} meses
          </Link>
          <a
            href={`/reportes/antiguedad/csv?meses=${mesesMin}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Descargar CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <p className="text-sm text-zinc-500">Fecha del reporte: {formatFecha(hoy)}</p>

      {filas.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">
          No hay deudores con {mesesMin} meses o mÃ¡s de antigÃ¼edad.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">TelÃ©fono</th>
                <th className="px-4 py-2 text-right">Saldo</th>
                <th className="px-4 py-2">Deuda mÃ¡s antigua</th>
                <th className="px-4 py-2 text-right">Meses</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-zinc-900">
                    {f.nombre}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{f.telefono ?? "â€”"}</td>
                  <td className="px-4 py-2 text-right font-semibold text-red-600">
                    {formatCOP(f.saldo)}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">
                    {formatFecha(f.fechaDeuda)}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-700">{f.meses}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-300 bg-zinc-50 font-semibold">
              <tr>
                <td className="px-4 py-2" colSpan={2}>
                  Total: {filas.length} deudor(es)
                </td>
                <td className="px-4 py-2 text-right text-red-700">
                  {formatCOP(totalAdeudado)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
