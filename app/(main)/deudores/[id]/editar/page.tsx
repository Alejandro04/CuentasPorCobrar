import { notFound } from "next/navigation";
import { DeudorForm } from "@/components/deudor-form";
import { actualizarDeudor } from "@/lib/actions/deudores";
import { getDeudor } from "@/lib/queries";

export default async function EditarDeudorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deudor = await getDeudor(id);
  if (!deudor) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold text-zinc-900">
        Editar a {deudor.nombre}
      </h1>
      <DeudorForm
        action={actualizarDeudor.bind(null, id)}
        deudor={deudor}
        cancelHref={`/deudores/${id}`}
      />
    </div>
  );
}
