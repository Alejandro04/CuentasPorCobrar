"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Paginacion({
  pagina,
  total,
  porPagina,
}: {
  pagina: number;
  total: number;
  porPagina: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  if (totalPaginas <= 1) return null;

  const ir = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (p <= 1) sp.delete("pagina");
    else sp.set("pagina", String(p));
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const btnCls =
    "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40";

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        type="button"
        disabled={pagina <= 1}
        onClick={() => ir(pagina - 1)}
        className={btnCls}
      >
        Anterior
      </button>
      <span className="text-sm text-zinc-600">
        Página {pagina} de {totalPaginas}
      </span>
      <button
        type="button"
        disabled={pagina >= totalPaginas}
        onClick={() => ir(pagina + 1)}
        className={btnCls}
      >
        Siguiente
      </button>
    </div>
  );
}
