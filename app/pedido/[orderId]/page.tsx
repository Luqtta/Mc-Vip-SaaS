"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResp = {
  order: {
    id: string;
    status: "pending" | "paid" | "delivered" | "failed";
    amountCents: number;
    currency: string;
    playerNick: string;
    serverId: string;
    mpPaymentId: string | null;
    createdAt: string;
    paidAt: string | null;
    deliveredAt: string | null;
    product: { slug: string; name: string; durationDays: number };
  };
  delivery: null | {
    id: string;
    status: "pending" | "processing" | "delivered" | "failed";
    attempts: number;
    lastError: string | null;
    lastErrorCode: string | null;
    nextAttemptAt: string | null;
    deliveredAt: string | null;
    failedAt: string | null;
  };
};

function moneyBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PedidoPage({ params, searchParams }: any) {
  const orderId = params.orderId as string;
  const result = (searchParams?.result as string) || "";

  const [data, setData] = useState<ApiResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const done = useMemo(() => {
    const s = data?.order.status;
    return s === "delivered" || s === "failed";
  }, [data]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao carregar status");
      setData(j);
    } catch (e: any) {
      setErr(e?.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (done) return;
    }, 5000);

    return () => clearInterval(t);
  }, [orderId, done]);

  if (loading && !data) {
    return <div style={{ padding: 24 }}>Carregando status do pedido...</div>;
  }

  if (err && !data) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontWeight: 700 }}>Erro</div>
        <div>{err}</div>
      </div>
    );
  }

  if (!data) return null;

  const o = data.order;
  const d = data.delivery;

  const statusLabel =
    o.status === "pending" ? "Aguardando pagamento" :
    o.status === "paid" ? "Pagamento aprovado — aguardando entrega" :
    o.status === "delivered" ? "Entregue com sucesso" :
    "Falhou (suporte/refund)";

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginBottom: 8 }}>Pedido #{o.id}</h1>
      {result ? <div style={{ opacity: 0.8, marginBottom: 12 }}>Retorno do Mercado Pago: {result}</div> : null}

      <div style={{ padding: 16, border: "1px solid #333", borderRadius: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{statusLabel}</div>
        <div style={{ opacity: 0.85 }}>
          Produto: <b>{o.product.name}</b> ({o.product.durationDays} dias)
        </div>
        <div style={{ opacity: 0.85 }}>
          Nick: <b>{o.playerNick}</b>
        </div>
        <div style={{ opacity: 0.85 }}>
          Valor: <b>{moneyBRL(o.amountCents)}</b>
        </div>
        {o.mpPaymentId ? (
          <div style={{ opacity: 0.85 }}>
            Payment ID: <b>{o.mpPaymentId}</b>
          </div>
        ) : null}
      </div>

      <div style={{ padding: 16, border: "1px solid #333", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Entrega</div>

        {!d ? (
          <div style={{ opacity: 0.85 }}>
            Ainda não há delivery criada (normal se o pagamento ainda não aprovou).
          </div>
        ) : (
          <>
            <div style={{ opacity: 0.85 }}>Delivery: <b>{d.id}</b></div>
            <div style={{ opacity: 0.85 }}>Status: <b>{d.status}</b></div>
            <div style={{ opacity: 0.85 }}>Tentativas: <b>{d.attempts}</b></div>

            {d.nextAttemptAt ? (
              <div style={{ opacity: 0.85 }}>
                Próxima tentativa: <b>{new Date(d.nextAttemptAt).toLocaleString("pt-BR")}</b>
              </div>
            ) : null}

            {d.lastError ? (
              <div style={{ marginTop: 10, padding: 12, border: "1px solid #444", borderRadius: 10 }}>
                <div style={{ fontWeight: 700 }}>Último erro</div>
                <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
                  {d.lastErrorCode ? `[${d.lastErrorCode}] ` : ""}{d.lastError}
                </div>
              </div>
            ) : null}

            {o.status === "failed" ? (
              <div style={{ marginTop: 14, opacity: 0.9 }}>
                Se precisar de reembolso/suporte, entre em contato informando o ID do pedido.
              </div>
            ) : null}
          </>
        )}
      </div>

      <div style={{ marginTop: 16, opacity: 0.75 }}>
        {done ? "Status final atingido." : "Atualizando automaticamente..."}
      </div>
    </div>
  );
}
