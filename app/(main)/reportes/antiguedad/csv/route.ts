import { NextResponse, type NextRequest } from "next/server";
import { hoyIso } from "@/lib/antiguedad";
import { buildCsv } from "@/lib/csv";
import { formatCOP } from "@/lib/format";
import { getDeudoresPendientesConMovimientos } from "@/lib/queries";
import { construirReporte } from "@/lib/reporte";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const mesesRaw = request.nextUrl.searchParams.get("meses");
  const mesesMin = mesesRaw === "6" ? 6 : 3;
  const hoy = hoyIso();

  const grupos = await getDeudoresPendientesConMovimientos();
  const filas = construirReporte(grupos, mesesMin, hoy);

  const csv = buildCsv(
    ["Nombre", "Telefono", "Saldo", "Deuda mas antigua", "Meses de antiguedad"],
    filas.map((f) => [
      f.nombre,
      f.telefono ?? "",
      formatCOP(f.saldo),
      f.fechaDeuda,
      f.meses,
    ]),
  );

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="antiguedad-${mesesMin}-meses-${hoy}.csv"`,
    },
  });
}
