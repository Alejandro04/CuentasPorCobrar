import { Suspense } from "react";
import { Header } from "@/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <Suspense
          fallback={<p className="py-10 text-center text-zinc-400">Cargando...</p>}
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
