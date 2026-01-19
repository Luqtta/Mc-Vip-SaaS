import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mpClient } from "@/lib/mp/client";
import { Preference } from "mercadopago";

function isValidNick(nick: string) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(nick);
}

export async function POST(req: Request) {
  let orderId: string | null = null;

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const productSlug = String(body.productSlug || "").trim();
    const playerNick = String(body.playerNick || "").trim();
    const serverId = String(
      body.serverId || process.env.DEFAULT_SERVER_ID || "default"
    ).trim();

    if (!productSlug) {
      return NextResponse.json(
        { error: "productSlug obrigatório" },
        { status: 400 }
      );
    }

    if (!playerNick || !isValidNick(playerNick)) {
      return NextResponse.json(
        { error: "Nick inválido (3-16, letras/números/_)" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Produto inválido" },
        { status: 404 }
      );
    }

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        playerNick,
        serverId,
        status: "pending",
        amountCents: product.priceCents,
        currency: product.currency,
      },
    });

    orderId = order.id;

    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(
      /\/$/,
      ""
    );

    const preference = new Preference(mpClient());

    const pref = await preference.create({
      body: {
        items: [
          {
            id: product.slug,
            title: product.name,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number((product.priceCents / 100).toFixed(2)),
          },
        ],

        external_reference: order.id,

      back_urls: {
        success: `${appUrl}/pedido/${order.id}?result=success`,
        failure: `${appUrl}/pedido/${order.id}?result=failure`,
        pending: `${appUrl}/pedido/${order.id}?result=pending`,
      },



        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
        },
      },
    });

    const initPoint = (pref as any)?.init_point;
    const prefId = (pref as any)?.id;

    if (!initPoint || !prefId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: "Falha ao criar checkout (sem init_point)" },
        { status: 500 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: String(prefId) },
    });

    return NextResponse.json({
      orderId: order.id,
      initPoint,
    });
  } catch (err: any) {
    console.error("create-checkout error:", err?.message);

    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "failed" },
        });
      } catch {}
    }

    return NextResponse.json(
      { error: "Erro interno", debug: err?.message },
      { status: 500 }
    );
  }
}
