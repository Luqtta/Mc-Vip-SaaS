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
    const deliveryId = String(body?.deliveryId || "");
    const error = String(body?.error || "UNKNOWN_ERROR").slice(0, 500);

    if (!deliveryId) return NextResponse.json({ error: "deliveryId obrigatório" }, { status: 400 });

    const retryMinutes = 30;
    const maxAttempts = 48; // 24h / 30min
    const maxAgeMs = 24 * 60 * 60 * 1000;

    const now = new Date();
    const nextTry = new Date(now.getTime() + retryMinutes * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const d = await tx.delivery.findUnique({
        where: { id: deliveryId },
        select: { id: true, status: true, attempts: true, createdAt: true, orderId: true },
      });

      if (!d) return { ok: false, status: 404 as const };

      if (d.status === DeliveryStatus.delivered) return { ok: true, already: true };

      const ageMs = now.getTime() - new Date(d.createdAt).getTime();
      const attemptsNext = d.attempts; 
      const expiredByTime = ageMs > maxAgeMs;
      const expiredByAttempts = attemptsNext >= maxAttempts;

      if (expiredByTime || expiredByAttempts) {
        await tx.delivery.update({
          where: { id: deliveryId },
          data: {
            status: DeliveryStatus.failed,
            lastError: error,
            leaseUntil: null,
          },
        });

        await tx.order.update({
          where: { id: d.orderId },
          data: { status: OrderStatus.failed },
        });

        return { ok: true, finalFail: true, expiredByTime, expiredByAttempts };
      }

      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.pending,
          lastError: error,
          leaseUntil: nextTry,
        },
      });

      return { ok: true, scheduled: true, nextTry };
    });

    if ((result as any).status === 404) {
      return NextResponse.json({ error: "Delivery não encontrada" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("fail delivery error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
