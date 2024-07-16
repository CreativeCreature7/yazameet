/*
  Warnings:

  - The values [PRODUCT] on the enum `Roles` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Roles_new" AS ENUM ('DESIGNER', 'PROJECTMANAGER', 'DATAANALYST', 'SUSTAINABILITYSPECIALIST', 'MARKETINGSTRATEGIST', 'FINANCIALANALYST', 'SOFTWAREDEVELOPER', 'PRODUCTMANAGER', 'PUBLICRELATIONSSPECIALIST', 'PSYCHOLOGISTHRSPECIALIST', 'LEGALCOMPLIANCEOFFICER');
ALTER TABLE "Project" ALTER COLUMN "rolesNeeded" TYPE "Roles_new"[] USING ("rolesNeeded"::text::"Roles_new"[]);
ALTER TYPE "Roles" RENAME TO "Roles_old";
ALTER TYPE "Roles_new" RENAME TO "Roles";
DROP TYPE "Roles_old";
COMMIT;
