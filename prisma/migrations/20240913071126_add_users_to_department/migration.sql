/*
  Warnings:

  - Added the required column `departmentId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INTERNAL', 'EXTERNAL', 'STAMPED', 'COMMAND', 'PUBLICITY', 'EVIDENCE');

-- CreateEnum
CREATE TYPE "Confidentiality" AS ENUM ('GENERAL', 'CONFIDENTIAL', 'HIGHLY_CONFIDENTIAL', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'DEPARTMENT_MEMBER', 'DEPARTMENT_HEAD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STAFF';

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "confidentiality" "Confidentiality" NOT NULL,
    "documentNumber" TEXT,
    "receivedDate" TIMESTAMP(3),
    "senderUnitId" INTEGER NOT NULL,
    "receiverUnitId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_senderUnitId_fkey" FOREIGN KEY ("senderUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_receiverUnitId_fkey" FOREIGN KEY ("receiverUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
