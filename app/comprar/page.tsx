import Link from "next/link";
import { ArrowLeft, CheckCircle, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { CheckoutForm } from "./CheckoutForm";
import { redirect } from "next/navigation";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function ComprarPage({
  searchParams,
}: {
  searchParams: Promise<{ productSlug?: string }>;
}) {
  const params = await searchParams;
  const productSlug = params?.productSlug;

  if (!productSlug) {
    redirect("/loja");
  }

  const product = await prisma.product.findUnique({
    where: { slug: productSlug, active: true },
  });

  if (!product) {
    redirect("/loja");
  }

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

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <Button asChild variant="ghost" size="sm" className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link href="/loja">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a loja
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Info */}
          <div className="animate-in fade-in slide-in-from-left-6 duration-700">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-sm font-medium">Produto selecionado</span>
                </div>
                <CardTitle className="text-3xl">{product.name}</CardTitle>
                <CardDescription>
                  {product.durationDays} dias de benefícios VIP
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-white">
                    {formatBRL(product.priceCents)}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">
                    Pagamento único
                  </p>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p className="text-sm font-medium text-neutral-300">
                    O que está incluído:
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Ativação instantânea e automática</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{product.durationDays} dias de acesso VIP completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Todos os benefícios exclusivos do VIP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Suporte prioritário 24/7</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-medium text-emerald-400">
                    ⚡ Entrega automática
                  </p>
                  <p className="mt-1 text-xs text-neutral-300">
                    Após a confirmação do pagamento, seu VIP será ativado automaticamente 
                    em até 60 segundos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="animate-in fade-in slide-in-from-right-6 duration-700 delay-200">
            <CheckoutForm product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}
