import prisma from "@/lib/prisma";
import { CheckoutDialog } from "./CheckoutDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function LojaPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      durationDays: true,
    },
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">MC VIP Store</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#produtos" className="text-neutral-400 hover:text-white transition">
              Produtos
            </a>
            <a href="#como-funciona" className="text-neutral-400 hover:text-white transition">
              Como funciona
            </a>
            <a href="#faq" className="text-neutral-400 hover:text-white transition">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <Zap className="h-4 w-4" />
              Entrega automática instantânea
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Compre seu VIP e receba
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {" "}automaticamente
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              Sistema 100% automatizado. Faça seu pagamento e receba o VIP no servidor em segundos. 
              Sem espera, sem burocracia.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
              <a
                href="#produtos"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition"
              >
                Ver produtos
              </a>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-semibold hover:bg-white/10 transition"
              >
                Como funciona
              </a>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="produtos" className="mx-auto max-w-6xl px-4 py-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Escolha seu VIP</h2>
            <p className="mt-2 text-neutral-400">
              Selecione o plano ideal para você
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="relative overflow-hidden border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/30 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>
                    {product.durationDays} dias de benefícios
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatBRL(product.priceCents)}
                  </div>
                  
                  <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Ativação instantânea
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {product.durationDays} dias de duração
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Benefícios exclusivos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Suporte 24/7
                    </li>
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <CheckoutDialog product={product} />
                </CardFooter>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              Nenhum produto disponível no momento.
            </div>
          )}
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="bg-white/[0.02] py-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Como funciona</h2>
              <p className="mt-2 text-neutral-400">
                Simples, rápido e automático
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Escolha seu VIP</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Selecione o plano que melhor se adequa às suas necessidades
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-2xl font-bold text-emerald-400">2</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Faça o pagamento</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Pague com Pix, cartão ou boleto via Mercado Pago
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-2xl font-bold text-emerald-400">3</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Receba automaticamente</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Entre no servidor e receba seu VIP em segundos
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Importante</span>
              </div>
              <p className="mt-2 text-sm text-neutral-300">
                Para receber automaticamente, entre no servidor com o nick informado na compra (jogador deve estar online).
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 py-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
            <p className="mt-2 text-neutral-400">
              Tire suas dúvidas
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-in scale-up duration-500 delay-100 hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold">Quanto tempo demora para receber?</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Após a aprovação do pagamento, o VIP é entregue automaticamente em até 60 segundos. 
                Você precisa estar online no servidor.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-in scale-up duration-500 delay-200 hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold">Quais formas de pagamento aceitas?</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Aceitamos Pix (instantâneo), cartão de crédito/débito e boleto bancário via Mercado Pago.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-in scale-up duration-500 delay-300 hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold">E se eu errar meu nick?</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Confira bem o nick antes de finalizar. Em caso de erro, entre em contato com o suporte.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-in scale-up duration-500 delay-400 hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold">O VIP é renovável?</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Sim! Você pode comprar novamente quando quiser. Os dias são acumulativos.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-12">
            <h2 className="text-3xl font-bold">Pronto para começar?</h2>
            <p className="mt-4 text-lg text-neutral-400">
              Escolha seu VIP e receba automaticamente no servidor
            </p>
            <a
              href="#produtos"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition"
            >
              Ver produtos
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} MC VIP Store. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
