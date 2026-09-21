/*
  Warnings:

  - You are about to drop the `_BookingToLineItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerEmail` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postcodeSurchargePence` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalPence` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `quotePence` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bookingId` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPricePence` to the `LineItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_BookingToLineItem" DROP CONSTRAINT "_BookingToLineItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingToLineItem" DROP CONSTRAINT "_BookingToLineItem_B_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "postcodeSurchargePence" INTEGER NOT NULL,
ADD COLUMN     "subtotalPence" INTEGER NOT NULL,
ALTER COLUMN "bookingStatus" SET DEFAULT 'PENDING',
ALTER COLUMN "quotePence" SET NOT NULL;

-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "unitPricePence" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_BookingToLineItem";

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX "LineItem_bookingId_idx" ON "LineItem"("bookingId");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
