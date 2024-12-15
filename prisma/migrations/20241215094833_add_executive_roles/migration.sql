-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Roles" ADD VALUE 'CMO';
ALTER TYPE "Roles" ADD VALUE 'CTO';
ALTER TYPE "Roles" ADD VALUE 'COFOUNDER';
ALTER TYPE "Roles" ADD VALUE 'CEO';
ALTER TYPE "Roles" ADD VALUE 'CPO';
ALTER TYPE "Roles" ADD VALUE 'CFO';
ALTER TYPE "Roles" ADD VALUE 'COO';
