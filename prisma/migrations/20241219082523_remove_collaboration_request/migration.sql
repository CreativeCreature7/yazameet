/*
  Warnings:

  - You are about to drop the `CollaborationRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CollaborationRequest" DROP CONSTRAINT "CollaborationRequest_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CollaborationRequest" DROP CONSTRAINT "CollaborationRequest_userId_fkey";

-- DropTable
DROP TABLE "CollaborationRequest";
