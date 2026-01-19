import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = String(params?.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId_required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        playerNick: true,
        serverId: true,
        mpPreferenceId: true,
        mpPaymentId: true,
        createdAt: true,
        paidAt: true,
        deliveredAt: true,
        product: { select: { slug: true, name: true, durationDays: true } },
        deliveries: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            id: true,
            status: true,
            attempts: true,
            lastError: true,
            leaseUntil: true,
            deliveredAt: true,
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const delivery = order.deliveries[0] || null;

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        amountCents: order.amountCents,
        currency: order.currency,
        playerNick: order.playerNick,
        serverId: order.serverId,
        mpPreferenceId: order.mpPreferenceId,
        mpPaymentId: order.mpPaymentId,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        deliveredAt: order.deliveredAt,
        product: order.product,
      },
      delivery: delivery
        ? {
            id: delivery.id,
            status: delivery.status,
            attempts: delivery.attempts,
            lastError: delivery.lastError,
            leaseUntil: delivery.leaseUntil,
            deliveredAt: delivery.deliveredAt,
          }
        : null,
    });
  } catch (err) {
    console.error("order status error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
