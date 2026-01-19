"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard } from "lucide-react";
import { TermsModal } from "./TermsModal";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  durationDays: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isValidNick(nick: string) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(nick);
}

export function CheckoutForm({ product }: { product: Product }) {
  const [nick, setNick] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [termsChecked, setTermsChecked] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedNick = nick.trim();
    if (!isValidNick(trimmedNick)) {
      setError("Nick inválido. Use apenas letras, números e _ (3-16 caracteres)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          playerNick: trimmedNick,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Erro ao criar checkout");
        setLoading(false);
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setError("Erro: link de pagamento não encontrado");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao processar pagamento");
      setLoading(false);
    }
  }

  const trimmedNick = nick.trim();
  const nickOk = isValidNick(trimmedNick);
  const canSubmit = !loading && trimmedNick.length > 0 && termsChecked && nickOk;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Finalizar compra</CardTitle>
          <CardDescription>Preencha seus dados para continuar</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nick" className="text-sm font-medium">
                Nick do Minecraft <span className="text-red-400">*</span>
              </label>
              <Input
                id="nick"
                placeholder="Ex: Steve123"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                disabled={loading}
                className="h-12 bg-white text-black placeholder-gray-500"
                autoFocus
              />
              <p className="text-xs text-neutral-400">
                Digite seu nick exatamente como aparece no jogo
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-xs font-medium text-yellow-500">⚠️ Importante:</p>
              <ul className="mt-2 space-y-1 text-xs text-neutral-300">
                <li>
                  • Você precisa estar <strong>online no servidor</strong> com este
                  nick
                </li>
                <li>• O VIP será entregue automaticamente após o pagamento</li>
                <li>
                  • Confira o nick antes de continuar (não pode ser alterado depois)
                </li>
              </ul>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Produto</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Duração</span>
                <span className="font-medium">{product.durationDays} dias</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatBRL(product.priceCents)}
                </span>
              </div>
            </div>

            {/* Termos */}
            <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <input
                type="checkbox"
                id="terms"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                disabled={loading}
                className="mt-1 h-4 w-4 cursor-pointer"
              />

              <div className="flex flex-wrap items-center gap-1 text-sm text-neutral-300">
                <label htmlFor="terms" className="cursor-pointer">
                  Concordo com os
                </label>

                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="underline text-blue-400 hover:text-blue-300 transition-colors"
                >
                  termos
                </button>

                <span>da loja</span>
              </div>
            </div>

            {/* Botão pagar (apagado quando disabled) */}
            <Button
              type="submit"
              disabled={!canSubmit}
              size="lg"
              className={`w-full transition-all ${
                !canSubmit ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Continuar para o pagamento
                </>
              )}
            </Button>

            <p className="text-center text-xs text-neutral-400">
              Você será redirecionado para o Mercado Pago para concluir o pagamento
            </p>
          </form>
        </CardContent>
      </Card>

      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => setTermsChecked(true)}
      />
    </>
  );
}
