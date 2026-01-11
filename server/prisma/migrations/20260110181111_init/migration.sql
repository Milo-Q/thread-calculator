-- CreateTable
CREATE TABLE "GarmentType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typeName" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "garmentType" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "singleCost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "threadType" TEXT NOT NULL,
    "spoolLength" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderDetail_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "process" TEXT NOT NULL,
    "measureValue" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measurement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "process" TEXT NOT NULL,
    "colorId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "measureValue" REAL,
    "unitUsage" REAL,
    "spoolLength" REAL NOT NULL,
    "requiredQty" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "purchaseAmount" REAL NOT NULL,
    "threadCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Calculation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GarmentType_typeName_idx" ON "GarmentType"("typeName");

-- CreateIndex
CREATE UNIQUE INDEX "GarmentType_typeName_attribute_key" ON "GarmentType"("typeName", "attribute");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");

-- CreateIndex
CREATE INDEX "Material_orderId_idx" ON "Material"("orderId");

-- CreateIndex
CREATE INDEX "OrderDetail_orderId_idx" ON "OrderDetail"("orderId");

-- CreateIndex
CREATE INDEX "OrderDetail_colorId_idx" ON "OrderDetail"("colorId");

-- CreateIndex
CREATE INDEX "Measurement_orderId_idx" ON "Measurement"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_orderId_process_key" ON "Measurement"("orderId", "process");

-- CreateIndex
CREATE INDEX "Calculation_orderId_idx" ON "Calculation"("orderId");

-- CreateIndex
CREATE INDEX "Calculation_orderId_process_idx" ON "Calculation"("orderId", "process");

-- CreateIndex
CREATE INDEX "Calculation_orderId_process_colorId_idx" ON "Calculation"("orderId", "process", "colorId");
