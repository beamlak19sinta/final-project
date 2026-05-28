ALTER TABLE "HelpDeskQuestion"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "forwardedToAdmin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "HelpDeskQuestion"
  ALTER COLUMN "userId" DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'HelpDeskQuestion_userId_fkey'
  ) THEN
    ALTER TABLE "HelpDeskQuestion" DROP CONSTRAINT "HelpDeskQuestion_userId_fkey";
  END IF;

  ALTER TABLE "HelpDeskQuestion"
    ADD CONSTRAINT "HelpDeskQuestion_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
END $$;
