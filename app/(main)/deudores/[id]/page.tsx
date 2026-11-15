import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-button";
import { FichaMovimientos } from "@/components/ficha-movimientos";
import { eliminarDeudor } from "@/lib/actions/deudores";
import { Paginacion } from "@/components/paginacion";
import { formatCOP } from "@/lib/format";
import { getSaldoDeudor, listMovimientos, POR_PAGINA } from "@/lib/queries";

export default async function FichaDeudorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pagina?: string | string[] }>;
}) {
  const { id } = await params;
  const deudor = await getSaldoDeudor(id);
  if (!deudor) notFound();
  const sp = await searchParams;
  const pagina = Number(Array.isArray(sp.pagina) ? sp.pagina[0] : sp.pagina) || 1;
  const { filas: movimientos, total } = await listMovimientos(id, pagina);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              {deudor.nombre}
            </h1>
            <div className="text-sm text-zinc-500">
              {deudor.telefono && <p>Tel: {deudor.telefono}</p>}
              {deudor.direccion && <p>Dir: {deudor.direccion}</p>}
              {deudor.notas && <p>{deudor.notas}</p>}
            </div>
          </div>
          <p
            className={`shrink-0 text-2xl font-bold ${
              deudor.saldo > 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCOP(deudor.saldo)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/deudores/${id}/editar`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Editar datos
          </Link>
          <ConfirmButton
            action={eliminarDeudor.bind(null, id)}
            label="Eliminar deudor"
            confirmText={`¿Eliminar a ${deudor.nombre} y todos sus movimientos? Esta acción no se puede deshacer.`}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          />
        </div>
      </div>

      <FichaMovimientos deudorId={id} movimientos={movimientos} total={total} />
      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} />
    </div>
  );
}
