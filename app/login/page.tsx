import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50">
      <h1 className="text-2xl font-semibold text-zinc-900">Cuentas por Cobrar</h1>
      <LoginForm />
    </main>
  );
}
