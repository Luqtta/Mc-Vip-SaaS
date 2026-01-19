import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = String(searchParams.get("orderId") || "").trim();
    if (!orderId) return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        playerNick: true,
        amountCents: true,
        currency: true,
        createdAt: true,
        paidAt: true,
        deliveredAt: true,
        product: { select: { slug: true, name: true, durationDays: true } },
        deliveries: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { status: true, attempts: true, lastError: true, leaseUntil: true, deliveredAt: true },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Order não encontrada" }, { status: 404 });

    const d = order.deliveries[0];

    return NextResponse.json({
      orderId: order.id,
      orderStatus: order.status,
      playerNick: order.playerNick,
      product: order.product,
      amountCents: order.amountCents,
      currency: order.currency,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      delivery: d
        ? {
            status: d.status,
            attempts: d.attempts,
            lastError: d.lastError,
            nextRetryAt: d.leaseUntil, 
            deliveredAt: d.deliveredAt,
          }
        : null,
    });
  } catch (err) {
    console.error("order status error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
