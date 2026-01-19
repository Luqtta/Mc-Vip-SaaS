/*
  Warnings:

  - Added the required column `updatedAt` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Made the column `resourceId` on table `PaymentEvent` required. This step will fail if there are existing NULL values in that column.

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
    "lastErrorCode" TEXT,
    "leaseUntil" DATETIME,
    "lockedBy" TEXT,
    "nextAttemptAt" DATETIME,
    "payload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deliveredAt" DATETIME,
    "failedAt" DATETIME,
    CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Delivery" ("attempts", "createdAt", "deliveredAt", "id", "lastError", "leaseUntil", "orderId", "payload", "serverId", "status") SELECT "attempts", "createdAt", "deliveredAt", "id", "lastError", "leaseUntil", "orderId", "payload", "serverId", "status" FROM "Delivery";
DROP TABLE "Delivery";
ALTER TABLE "new_Delivery" RENAME TO "Delivery";
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");
CREATE INDEX "Delivery_serverId_status_idx" ON "Delivery"("serverId", "status");
CREATE INDEX "Delivery_leaseUntil_idx" ON "Delivery"("leaseUntil");
CREATE INDEX "Delivery_nextAttemptAt_idx" ON "Delivery"("nextAttemptAt");
CREATE TABLE "new_PaymentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'mercadopago',
    "type" TEXT,
    "resourceId" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME
);
INSERT INTO "new_PaymentEvent" ("createdAt", "id", "processed", "provider", "raw", "resourceId", "type") SELECT "createdAt", "id", "processed", "provider", "raw", "resourceId", "type" FROM "PaymentEvent";
DROP TABLE "PaymentEvent";
ALTER TABLE "new_PaymentEvent" RENAME TO "PaymentEvent";
CREATE INDEX "PaymentEvent_resourceId_idx" ON "PaymentEvent"("resourceId");
CREATE UNIQUE INDEX "PaymentEvent_provider_resourceId_key" ON "PaymentEvent"("provider", "resourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_mpPreferenceId_idx" ON "Order"("mpPreferenceId");
