/*
  Warnings:

  - The `purpose` column on the `ContactRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ContactPurpose" AS ENUM ('MOREDETAILS', 'COLLAB', 'MEETFORCOFFEE');

-- AlterTable
ALTER TABLE "ContactRequest" DROP COLUMN "purpose",
ADD COLUMN     "purpose" "ContactPurpose";
