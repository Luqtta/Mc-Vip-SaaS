import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DeliveryStatus } from "@prisma/client";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function getAuthToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function GET(req: Request) {
  try {
    const token = getAuthToken(req);
    if (!token || token !== process.env.DELIVERY_TOKEN) return unauthorized();

    const { searchParams } = new URL(req.url);
    const serverId = (searchParams.get("serverId") || process.env.DEFAULT_SERVER_ID || "default").trim();

    const leaseSeconds = Number(searchParams.get("leaseSeconds") || 60);
    const leaseMs = Math.max(10, Math.min(600, leaseSeconds)) * 1000;
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + leaseMs);

    const claimed = await prisma.$transaction(async (tx) => {
      const candidate = await tx.delivery.findFirst({
        where: {
          serverId,
          status: DeliveryStatus.pending,
          OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!candidate) return null;

      const updated = await tx.delivery.updateMany({
        where: {
          id: candidate.id,
          status: DeliveryStatus.pending,
          OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
        },
        data: {
          status: DeliveryStatus.processing,
          leaseUntil,
          attempts: { increment: 1 },
        },
      });

      if (updated.count === 0) return null;

      return tx.delivery.findUnique({
        where: { id: candidate.id },
        select: {
          id: true,
          orderId: true,
          status: true,
          attempts: true,
          leaseUntil: true,
          payload: true,
          order: {
            select: {
              playerNick: true,
              serverId: true,
              product: { select: { slug: true, name: true, durationDays: true } },
            },
          },
        },
      });
    });

    if (!claimed) return NextResponse.json({ serverId, count: 0, deliveries: [] });

    const payload = {
      deliveryId: claimed.id,
      orderId: claimed.orderId,
      serverId: claimed.order.serverId,
      attempts: claimed.attempts,
      leaseUntil: claimed.leaseUntil,
      playerNick: claimed.order.playerNick,
      productSlug: claimed.order.product.slug,
      productName: claimed.order.product.name,
      durationDays: claimed.order.product.durationDays,
      commands: (claimed.payload as any)?.commands || [],
    };

    return NextResponse.json({ serverId, count: 1, deliveries: [payload] });
  } catch (err) {
    console.error("pending deliveries error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
