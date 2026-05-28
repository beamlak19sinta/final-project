-- Add role variant requested by product requirements.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'HELP_DESK';

-- Registration enhancement.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;
UPDATE "User"
SET "nationalId" = LPAD(REGEXP_REPLACE("phoneNumber", '\D', '', 'g'), 16, '0')
WHERE "nationalId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "nationalId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "User_nationalId_key" ON "User"("nationalId");

-- Appointment rejection details.
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Password reset and question/feedback support.
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'PasswordResetToken_userId_fkey'
  ) THEN
    ALTER TABLE "PasswordResetToken"
      ADD CONSTRAINT "PasswordResetToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "HelpDeskQuestion" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "reply" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "repliedAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  "repliedById" TEXT,
  CONSTRAINT "HelpDeskQuestion_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'HelpDeskQuestion_userId_fkey'
  ) THEN
    ALTER TABLE "HelpDeskQuestion"
      ADD CONSTRAINT "HelpDeskQuestion_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'HelpDeskQuestion_repliedById_fkey'
  ) THEN
    ALTER TABLE "HelpDeskQuestion"
      ADD CONSTRAINT "HelpDeskQuestion_repliedById_fkey"
      FOREIGN KEY ("repliedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Feedback" (
  "id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "rating" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
