-- CreateEnum
CREATE TYPE "IdeationPhase" AS ENUM ('IDEATION', 'SORTING', 'SELECTION', 'COMPLETED');

-- CreateTable
CREATE TABLE "IdeationSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "phase" "IdeationPhase" NOT NULL DEFAULT 'IDEATION',
    "winningIdea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "IdeationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rank" INTEGER,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeationSession_createdById_idx" ON "IdeationSession"("createdById");

-- CreateIndex
CREATE INDEX "Idea_sessionId_idx" ON "Idea"("sessionId");

-- AddForeignKey
ALTER TABLE "IdeationSession" ADD CONSTRAINT "IdeationSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "IdeationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
