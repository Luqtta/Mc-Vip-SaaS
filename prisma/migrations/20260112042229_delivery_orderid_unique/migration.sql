/*
  Warnings:

  - A unique constraint covering the columns `[provider,resourceId]` on the table `PaymentEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL DEFAULT 'default',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "leaseUntil" DATETIME,
    "payload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Delivery" ("attempts", "createdAt", "deliveredAt", "id", "lastError", "leaseUntil", "orderId", "payload", "serverId", "status") SELECT "attempts", "createdAt", "deliveredAt", "id", "lastError", "leaseUntil", "orderId", "payload", "serverId", "status" FROM "Delivery";
DROP TABLE "Delivery";
ALTER TABLE "new_Delivery" RENAME TO "Delivery";
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_provider_resourceId_key" ON "PaymentEvent"("provider", "resourceId");
