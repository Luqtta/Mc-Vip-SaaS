-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "playerNick" TEXT NOT NULL,
    "serverId" TEXT NOT NULL DEFAULT 'default',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "deliveredAt" DATETIME,
    CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amountCents", "createdAt", "currency", "deliveredAt", "id", "mpPaymentId", "mpPreferenceId", "paidAt", "playerNick", "productId", "serverId", "status", "updatedAt") SELECT "amountCents", "createdAt", "currency", "deliveredAt", "id", "mpPaymentId", "mpPreferenceId", "paidAt", "playerNick", "productId", "serverId", "status", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_mpPaymentId_key" ON "Order"("mpPaymentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
