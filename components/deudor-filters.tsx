"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function DeudorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [nombre, setNombre] = useState(searchParams.get("q") ?? "");

  const actualizar = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [clave, valor] of Object.entries(params)) {
        if (valor) sp.set(clave, valor);
        else sp.delete(clave);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if ((searchParams.get("q") ?? "") !== nombre) actualizar({ q: nombre });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre]);

  const labelCls = "text-xs font-medium text-zinc-600";
  const inputCls =
    "block w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="q" className={labelCls}>
          Buscar por nombre
        </label>
        <input
          id="q"
          type="search"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del deudor"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="estado" className={labelCls}>
          Estado
        </label>
        <select
          id="estado"
          defaultValue={searchParams.get("estado") ?? "todos"}
          onChange={(e) =>
            actualizar({ estado: e.target.value === "todos" ? "" : e.target.value })
          }
          className={inputCls}
        >
          <option value="todos">Todos</option>
          <option value="pendientes">Pendientes</option>
          <option value="pagados">Pagados</option>
        </select>
      </div>
      <div>
        <label htmlFor="desde" className={labelCls}>
          Registrado desde
        </label>
        <input
          id="desde"
          type="date"
          defaultValue={searchParams.get("desde") ?? ""}
          onChange={(e) => actualizar({ desde: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="hasta" className={labelCls}>
          Hasta
        </label>
        <input
          id="hasta"
          type="date"
          defaultValue={searchParams.get("hasta") ?? ""}
          onChange={(e) => actualizar({ hasta: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  );
}
