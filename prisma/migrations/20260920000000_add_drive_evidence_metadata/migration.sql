ALTER TABLE `quarterly_performance_values`
  ADD COLUMN `evidenceDriveFileId` VARCHAR(255) NULL,
  ADD COLUMN `evidenceDriveViewUrl` VARCHAR(500) NULL,
  ADD COLUMN `evidenceFileName` VARCHAR(255) NULL,
  ADD COLUMN `evidenceMimeType` VARCHAR(150) NULL,
  ADD COLUMN `evidenceFileSize` INT NULL,
  ADD COLUMN `evidenceUploadedAt` DATETIME(3) NULL;
