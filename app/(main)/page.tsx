import Link from "next/link";
import { Suspense } from "react";
import { DeudorFilters } from "@/components/deudor-filters";
import { formatCOP, formatFecha } from "@/lib/format";
import { Paginacion } from "@/components/paginacion";
import { listDeudores, POR_PAGINA, type FiltrosDeudores } from "@/lib/queries";

function texto(
  sp: Record<string, string | string[] | undefined>,
  clave: string,
): string | undefined {
  const v = sp[clave];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const estadoRaw = texto(sp, "estado");
  const filtros: FiltrosDeudores = {
    q: texto(sp, "q"),
    cedula: texto(sp, "cedula"),
    estado:
      estadoRaw === "pendientes" || estadoRaw === "pagados"
        ? estadoRaw
        : "todos",
    desde: texto(sp, "desde"),
    hasta: texto(sp, "hasta"),
  };
  const pagina = Number(texto(sp, "pagina")) || 1;
  const { filas: deudores, total } = await listDeudores(filtros, pagina);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">Deudores</h1>
        <Link
          href="/deudores/nuevo"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nuevo deudor
        </Link>
      </div>

      <Suspense>
        <DeudorFilters />
      </Suspense>

      {deudores.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">
          No hay deudores que coincidan.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deudores.map((d) => (
            <li key={d.id}>
              <Link
                href={`/deudores/${d.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">{d.nombre}</p>
                  <p className="text-xs text-zinc-500">
                    {d.telefono ?? "Sin teléfono"}
                    {d.fecha_ultimo_movimiento &&
                      ` · Últ. mov. ${formatFecha(d.fecha_ultimo_movimiento)}`}
                  </p>
                </div>
                <p
                  className={`shrink-0 font-semibold ${
                    d.saldo > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {formatCOP(d.saldo)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} />

      <div className="flex gap-2 pt-2">
        <Link
          href="/reportes/antiguedad?meses=3"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-white"
        >
          Reporte 3 meses
        </Link>
        <Link
          href="/reportes/antiguedad?meses=6"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-white"
        >
          Reporte 6 meses
        </Link>
      </div>
    </div>
  );
}
