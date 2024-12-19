/*
  Warnings:

  - You are about to drop the column `status` on the `ContactRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContactRequest" DROP COLUMN "status",
ADD COLUMN     "addedToProject" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "RequestStatus";
