import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">MC VIP Store</span>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>

          <h1 className="mt-6 text-3xl font-bold">Pagamento aprovado!</h1>
          
          <p className="mt-4 text-lg text-neutral-300">
            Seu VIP será entregue automaticamente em até 60 segundos.
          </p>

          {params.orderId && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-neutral-400">Pedido</p>
              <p className="mt-1 font-mono text-sm text-neutral-200">
                {params.orderId}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left">
            <p className="text-sm font-medium text-yellow-500">
              Importante:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-300">
              <li>• Entre no servidor com o nick informado na compra</li>
              <li>• O VIP será aplicado automaticamente enquanto você estiver online</li>
              <li>• Se não receber em 2 minutos, entre em contato com o suporte</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/loja">
                Voltar para a loja
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-sm text-neutral-400">
          Problemas? Entre em contato com nosso suporte.
        </p>
      </main>
    </div>
  );
}
