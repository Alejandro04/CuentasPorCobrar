import { DeudorForm } from "@/components/deudor-form";
import { crearDeudor } from "@/lib/actions/deudores";

export default function NuevoDeudorPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold text-zinc-900">Nuevo deudor</h1>
      <DeudorForm action={crearDeudor} conDeudaInicial />
    </div>
  );
}
