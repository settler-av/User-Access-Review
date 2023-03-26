-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('MONTHLY', 'QUATERLY', 'ADHOC');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('OPEN', 'MANAGER_REVIEW_COM', 'APP_OWNER_REVIEW_COM', 'CLOSED');

-- CreateEnum
CREATE TYPE "review_stat" AS ENUM ('MANAGER_ACEEPTED', 'MANAGER_REJECTED', 'APP_OWNER_ACEEPTED', 'APP_OWNER_REJECTED', 'PENDING', 'DONE');

-- CreateTable
CREATE TABLE "employee" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "name" TEXT NOT NULL,
    "core_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "manager_id" INTEGER,
    "department" TEXT,
    "group_sis_id" INTEGER,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("sis_id")
);

-- CreateTable
CREATE TABLE "group" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("sis_id")
);

-- CreateTable
CREATE TABLE "employee_group" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "employee_group_pkey" PRIMARY KEY ("sis_id")
);

-- CreateTable
CREATE TABLE "application" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "owner_gid" INTEGER NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("sis_id")
);

-- CreateTable
CREATE TABLE "application_access" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "access_id" TEXT NOT NULL,
    "application_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "permission" TEXT NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "application_access_pkey" PRIMARY KEY ("sis_id")
);

-- CreateTable
CREATE TABLE "review" (
    "sis_id" SERIAL NOT NULL,
    "rec_st" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "review_id" TEXT NOT NULL,
    "access_id" TEXT NOT NULL,
    "application_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "quater" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "review_type" "ReviewType" NOT NULL,
    "status" "status" NOT NULL DEFAULT 'OPEN',
    "review_accept_reject" "review_stat" NOT NULL DEFAULT 'PENDING',
    "review_comments" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),

    CONSTRAINT "review_pkey" PRIMARY KEY ("sis_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_core_id_key" ON "employee"("core_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "application_access_access_id_key" ON "application_access"("access_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_review_id_key" ON "review"("review_id");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employee"("sis_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_group_sis_id_fkey" FOREIGN KEY ("group_sis_id") REFERENCES "group"("sis_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_group" ADD CONSTRAINT "employee_group_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_group" ADD CONSTRAINT "employee_group_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_group" ADD CONSTRAINT "employee_group_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_group" ADD CONSTRAINT "employee_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_owner_gid_fkey" FOREIGN KEY ("owner_gid") REFERENCES "group"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_access" ADD CONSTRAINT "application_access_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_access" ADD CONSTRAINT "application_access_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_access" ADD CONSTRAINT "application_access_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_access" ADD CONSTRAINT "application_access_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_access_id_fkey" FOREIGN KEY ("access_id") REFERENCES "application_access"("access_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("sis_id") ON DELETE RESTRICT ON UPDATE CASCADE;
