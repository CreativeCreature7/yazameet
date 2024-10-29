-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('NONPROFIT', 'FORPROFIT', 'IMPACT');

-- AlterEnum
ALTER TYPE "Year" ADD VALUE 'FOURTHYEAR';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "type" "ProjectType"[];
