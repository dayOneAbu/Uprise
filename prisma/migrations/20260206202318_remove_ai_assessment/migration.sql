/*
  Warnings:

  - You are about to drop the column `aiAnalysis` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `aiFeedback` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `answerContent` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `isAiFlagged` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `gradingRubric` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `testPrompt` on the `Job` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("candidateId", "createdAt", "id", "jobId", "status") SELECT "candidateId", "createdAt", "id", "jobId", "status" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "Application"("candidateId", "jobId");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "locationType" TEXT,
    "duration" INTEGER,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "salaryRange" TEXT,
    "skillsRequired" TEXT,
    "experienceLevel" TEXT,
    "companyId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("companyId", "createdAt", "description", "employerId", "id", "status", "title", "updatedAt") SELECT "companyId", "createdAt", "description", "employerId", "id", "status", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
