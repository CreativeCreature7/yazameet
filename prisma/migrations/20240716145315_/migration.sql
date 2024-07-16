/*
  Warnings:

  - Added the required column `year` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Year" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "Roles"[],
ADD COLUMN     "year" "Year" NOT NULL;
