# MC VIP SaaS (Loja + Entrega Automática via Plugin) — Monorepo

SaaS para venda de VIP em servidores Minecraft com entrega automática via plugin (Bukkit 1.6.4).
O usuário compra na loja, paga via Mercado Pago Checkout Pro e, após aprovação, o sistema cria uma Delivery.
O plugin do servidor faz polling das deliveries pendentes e executa os comandos no console, confirmando a entrega.

Status atual:
- Backend + checkout + webhook + delivery funcionando em ambiente local.
- Plugin versionado no repositório (não rodando em produção).
- Integração real ocorre quando houver um servidor Minecraft 24/7.

---

## Fluxo (alto nível)

1. Usuário entra na loja (frontend)
2. Seleciona produto (VIP1, VIP2 etc)
3. Informa nick do Minecraft
4. Paga via Mercado Pago Checkout Pro
5. Webhook do Mercado Pago:
   - consulta o Payment
   - marca Order como paid
   - cria Delivery única (1 order = 1 delivery)
6. Plugin Bukkit 1.6.4:
   - faz polling das deliveries pendentes
   - executa commands no console
   - sucesso -> confirm
   - falha -> fail (retry automático)

---

## Stack

- Next.js (App Router)
- Prisma ORM
- SQLite (dev) / Postgres (produção planejada)
- Mercado Pago SDK oficial
- Checkout Pro (sem Pix manual, sem Bricks)
- Plugin Bukkit 1.6.4 (Java + json-simple)

---

## Estrutura do Monorepo

mc-vip-saas/
├─ app/
│  ├─ loja/
│  ├─ api/
│  │  ├─ checkout/create/route.ts
│  │  ├─ mp/webhook/route.ts
│  │  ├─ orders/[orderId]/route.ts
│  │  └─ deliveries/
│  │     ├─ pending/route.ts
│  │     ├─ confirm/route.ts
│  │     └─ fail/route.ts
├─ lib/
│  ├─ prisma.ts
│  └─ mp/client.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ dev.db (somente local)
└─ plugin/
   └─ VipDeliverer/
      ├─ src/
      ├─ plugin.yml
      └─ config.yml.example

---

## O que já funciona

- Criação de checkout via /api/checkout/create
- Order criada com status pending
- Pagamento via Mercado Pago Checkout Pro
- Webhook:
  - valida pagamento aprovado
  - cria Delivery única (upsert)
- Plugin:
  - busca deliveries pendentes
  - executa comandos no servidor
  - confirma entrega
  - retry automático se player estiver offline

---

## Segurança (MVP)

- Endpoints do plugin protegidos por Bearer Token
- Webhook protegido por token na query
- Proteção contra duplicação:
  - Delivery.orderId é unique
  - PaymentEvent é unique por provider/resourceId
  - Webhook usa transaction + upsert

---

## Rodar local (dev)

1) Instalar dependências:
npm install

2) Criar arquivo .env (não commitar):
Use como base o .env.example

3) Prisma (SQLite):
npx prisma migrate dev
npx prisma generate

4) Rodar:
npm run dev

Loja disponível em:
http://localhost:3000/loja

---

## Webhook no dev (localhost)

O Mercado Pago não consegue chamar localhost diretamente.
Para testar webhook local, use ngrok:

ngrok http 3000

Configure o webhook do Mercado Pago para:
https://SEU-NGROK.ngrok-free.app/api/mp/webhook?token=SEU_MP_WEBHOOK_TOKEN

---

## Ver status do pedido (API)

Após criar um pedido:

GET /api/orders/{orderId}

Estados:
- pending: aguardando pagamento
- paid: pagamento aprovado, aguardando entrega
- delivered: entrega concluída
- failed: falha definitiva

---

## Plugin Bukkit 1.6.4

O plugin fica em:
plugin/VipDeliverer

Exemplo de config.yml:

api:
  baseUrl: "http://localhost:3000"
  token: "SEU_DELIVERY_TOKEN"
  serverId: "default"
  pollSeconds: 5
  leaseSeconds: 60

Em produção, baseUrl deve apontar para o domínio do site (Vercel).

---

## Produção (planejado)

Quando houver um servidor Minecraft online:

- Deploy do site (Vercel)
- Banco Postgres (Neon recomendado)
- Webhook fixo do Mercado Pago apontando para o domínio
- Plugin instalado no servidor com token válido

---

## Observações finais

- Este projeto utiliza Checkout Pro (não Pix manual, não Bricks).
- A entrega automática depende de um servidor Minecraft rodando 24/7.
- Tokens e segredos nunca devem ser commitados no GitHub.
