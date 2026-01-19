import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DeliveryStatus, OrderStatus } from "@prisma/client";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function getAuthToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function POST(req: Request) {
  try {
    const token = getAuthToken(req);
    if (!token || token !== process.env.DELIVERY_TOKEN) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body?.deliveryId) {
      return NextResponse.json({ error: "deliveryId obrigatório" }, { status: 400 });
    }

    const deliveryId = String(body.deliveryId);

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { id: true, status: true, orderId: true },
    });

    if (!delivery) return NextResponse.json({ ok: true, missing: true });

    if (delivery.status === DeliveryStatus.delivered) {
      return NextResponse.json({ ok: true, already: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.delivered,
          deliveredAt: new Date(),
          leaseUntil: null,
          lastError: null,
        },
      });

      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: OrderStatus.delivered,
          deliveredAt: new Date(),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("confirm delivery error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
