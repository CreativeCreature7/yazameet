/*
  Warnings:

  - You are about to drop the column `collaborators` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "collaborators",
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "_ProjectCollaborators" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectCollaborators_AB_unique" ON "_ProjectCollaborators"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectCollaborators_B_index" ON "_ProjectCollaborators"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCollaborators" ADD CONSTRAINT "_ProjectCollaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCollaborators" ADD CONSTRAINT "_ProjectCollaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
