"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/80"
        onClick={onClose}
        aria-label="Fechar termos"
      />

      {/* Modal */}
      <div className="relative z-[10000] w-[min(900px,92vw)] h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Termos e Condições da Loja
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Leia atentamente antes de fazer sua compra
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="terms-scroll flex-1 overflow-y-auto p-6 text-sm text-neutral-300">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-white mb-2">1. Sobre o VIP</h3>
              <p>
                Este é um serviço de venda de VIP em nosso servidor Minecraft. Ao
                comprar VIP, você está adquirindo um benefício adicional no
                servidor por um período determinado (em dias).
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                2. Entrega Automática
              </h3>
              <p>
                Após a confirmação do pagamento, o VIP será entregue
                automaticamente ao seu nick de Minecraft. Você não precisa fazer
                nada adicional. O sistema é totalmente automatizado e a entrega
                ocorre em poucos minutos após a confirmação.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                3. Requisitos para Recebimento
              </h3>
              <p>
                Para receber o VIP automaticamente, você deve estar conectado ao
                servidor no momento da entrega ou conectar-se dentro de 24 horas
                após o pagamento. Se não se conectar neste período, entre em
                contato com a administração para reclamar seu VIP.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                4. Prazo de Tentativas
              </h3>
              <p>
                O sistema tentará entregar o VIP automaticamente por 7 dias. Após
                este período, você deverá entrar em contato conosco para solicitar
                a entrega manual. Mantenha seu comprovante de pagamento em mãos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                5. Política de Reembolso (Produto Digital)
              </h3>
              <p>
                Após a compra e a confirmação do pagamento, por se tratar de um{" "}
                <strong>produto digital</strong>,{" "}
                <strong>não há reembolso</strong>. Caso ocorra{" "}
                <strong>falha comprovada</strong> na entrega/ativação por erro do
                sistema, prestaremos suporte para corrigir o problema (entrega
                manual/reativação quando aplicável).
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                6. Responsabilidade do Usuário
              </h3>
              <p>
                Você é responsável por fornecer um nick de Minecraft válido e
                correto. Revise cuidadosamente antes de confirmar a compra, pois
                não podemos alterar o nick após o pagamento. Não somos
                responsáveis por erros de digitação.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">
                7. Política de Chargeback
              </h3>
              <p>
                Qualquer tentativa de chargeback resultará no banimento permanente
                da conta e do nick de Minecraft associado. Não faremos exceções.
                Se tiver problemas com o pagamento, entre em contato conosco
                primeiro.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">8. Suporte</h3>
              <p>
                Para dúvidas ou problemas, entre em contato com nosso suporte
                através do Discord ou do site. Tentaremos resolver seu problema o
                mais rápido possível. Conserve seu comprovante de pagamento para
                referência.
              </p>
            </section>
          </div>
        </div>

        {/* Footer (APENAS botão principal) */}
        <div className="border-t border-white/10 p-6">
          <Button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="w-full h-16 text-base font-semibold"
          >
            Eu li e concordo
          </Button>
        </div>
      </div>

      {/* Scrollbar branca com track cinza */}
      <style jsx global>{`
        .terms-scroll {
          scrollbar-color: rgba(255, 255, 255, 0.75) #262626;
          scrollbar-width: thin;
        }
        .terms-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .terms-scroll::-webkit-scrollbar-track {
          background: #262626;
          border-radius: 999px;
        }
        .terms-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.65);
          border-radius: 999px;
          border: 2px solid #262626;
        }
        .terms-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.85);
        }
      `}</style>
    </div>,
    document.body
  );
}
