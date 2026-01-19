import prisma from "@/lib/prisma";

export async function createDeliveryIfNeeded(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, deliveries: true },
  });

  if (!order) return { created: false, reason: "order_not_found" };

  // só cria delivery se order estiver paid
  if (order.status !== "paid") {
    return { created: false, reason: "order_not_paid" };
  }

  // idempotência: se já existir delivery, não cria outra
  if (order.deliveries.length > 0) {
    return { created: false, reason: "delivery_already_exists" };
  }

  const payload = {
    orderId: order.id,
    serverId: order.serverId,
    playerNick: order.playerNick,
    product: {
      slug: order.product.slug,
      name: order.product.name,
      durationDays: order.product.durationDays,
    },
    command: `givevip ${order.playerNick} vip ${order.product.durationDays}`,
  };

  const delivery = await prisma.delivery.create({
    data: {
      orderId: order.id,
      status: "pending",
      payload,
    },
  });

  return { created: true, deliveryId: delivery.id };
}
