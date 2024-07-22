/*
  Warnings:

  - The values [FIRST,SECOND,THIRD] on the enum `Year` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Year_new" AS ENUM ('FIRSTYEAR', 'SECONDYEAR', 'THIRDYEAR');
ALTER TABLE "User" ALTER COLUMN "year" TYPE "Year_new" USING ("year"::text::"Year_new");
ALTER TYPE "Year" RENAME TO "Year_old";
ALTER TYPE "Year_new" RENAME TO "Year";
DROP TYPE "Year_old";
COMMIT;
