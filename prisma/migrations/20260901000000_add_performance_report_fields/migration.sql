ALTER TABLE `performance_submissions`
  ADD COLUMN `reportingMonth` TINYINT NULL,
  ADD COLUMN `reportingQuarter` TINYINT NULL,
  ADD COLUMN `realizationNarrative` TEXT NULL,
  ADD COLUMN `evaluation` TEXT NULL,
  ADD COLUMN `constraints` TEXT NULL,
  ADD COLUMN `followUp` TEXT NULL,
  ADD COLUMN `physicalRealization` DECIMAL(20, 6) NULL;
