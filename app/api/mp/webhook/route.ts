import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mpPaymentClient } from "@/lib/mp/client";
import { DeliveryStatus, OrderStatus } from "@prisma/client";

export const runtime = "nodejs";

function extractPaymentId(body: any): string | null {
  return (
    body?.data?.id?.toString?.() ||
    body?.id?.toString?.() ||
    body?.resource?.split?.("/")?.pop?.() ||
    null
  );
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token || token !== process.env.MP_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentIdStr = extractPaymentId(body);
    if (!paymentIdStr) return NextResponse.json({ ok: true });

    const paymentId = Number(paymentIdStr);
    if (!Number.isFinite(paymentId)) return NextResponse.json({ ok: true });

    // Anti-replay: cria PaymentEvent unique(provider, resourceId)
    const event = await prisma.paymentEvent.upsert({
      where: { provider_resourceId: { provider: "mercadopago", resourceId: String(paymentId) } },
      update: { raw: body },
      create: {
        provider: "mercadopago",
        resourceId: String(paymentId),
        raw: body,
        processed: false,
      },
      select: { id: true, processed: true },
    });

    if (event.processed) return NextResponse.json({ ok: true, replay: true });

    const payment = await mpPaymentClient().get({ id: paymentId });

    if (payment.status !== "approved") return NextResponse.json({ ok: true });

    const orderId = payment.external_reference?.toString?.();
    if (!orderId) return NextResponse.json({ ok: true });

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.pending },
        data: {
          status: OrderStatus.paid,
          mpPaymentId: String(paymentId),
          paidAt: new Date(),
        },
      });

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      });

      if (!order) return;

      const commands = (order.product.deliveryCommands as any[]).map((cmd) =>
        String(cmd)
          .replaceAll("{nick}", order.playerNick)
          .replaceAll("{days}", String(order.product.durationDays))
      );

      await tx.delivery.upsert({
        where: { orderId },
        update: {},
        create: {
          orderId,
          serverId: order.serverId,
          status: DeliveryStatus.pending,
          payload: {
            playerNick: order.playerNick,
            productSlug: order.product.slug,
            durationDays: order.product.durationDays,
            commands,
          },
        },
      });

      await tx.paymentEvent.update({
        where: { id: event.id },
        data: { processed: true },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
