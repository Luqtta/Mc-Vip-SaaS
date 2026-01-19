"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  durationDays: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isValidNick(nick: string) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(nick);
}

export default function CheckoutButton({ products }: { products: Product[] }) {
  const [nick, setNick] = useState("Lucas123");
  const [slug, setSlug] = useState(products?.[0]?.slug ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selected = useMemo(() => products.find((p) => p.slug === slug), [products, slug]);

  async function buy() {
    setErr(null);

    const n = nick.trim();
    if (!isValidNick(n)) {
      setErr("Nick inválido (3-16, letras/números/_).");
      return;
    }
    if (!slug) {
      setErr("Selecione um produto.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          playerNick: n,
          // serverId opcional: "default"
        }),
      });

      const data = await r.json();
      if (!r.ok) {
        setErr(data?.error || "Erro ao iniciar checkout.");
        setLoading(false);
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }

      setErr("Checkout criado, mas initPoint não retornou.");
    } catch (e: any) {
      setErr(e?.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #222", borderRadius: 12 }}>
      <div>
        <label style={{ fontWeight: 700 }}>Nick do Minecraft</label>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="SeuNick"
          style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 10, border: "1px solid #333" }}
        />
      </div>

      <div>
        <label style={{ fontWeight: 700 }}>VIP</label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 10, border: "1px solid #333" }}
        >
          {products.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name} • {p.durationDays} dias • {formatBRL(p.priceCents)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={buy}
        disabled={loading || !selected}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 800,
          background: "#1E90FF",
          color: "white",
        }}
      >
        {loading ? "Redirecionando..." : `Comprar ${selected ? formatBRL(selected.priceCents) : ""}`}
      </button>

      {err && (
        <div style={{ color: "#ff4d4d", fontWeight: 700 }}>
          {err}
        </div>
      )}
    </div>
  );
}
