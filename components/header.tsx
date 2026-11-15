import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function Header() {
  return (
    <header className="no-print border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-zinc-900">
            Cuentas por Cobrar
          </Link>
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            Inicio
          </Link>
          <Link
            href="/reportes/antiguedad?meses=3"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Reportes
          </Link>
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
