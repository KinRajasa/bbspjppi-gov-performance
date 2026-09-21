CREATE TABLE `action_plans` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `indikator_id` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `action_plans_indikator_id_key` (`indikator_id`),
  CONSTRAINT `action_plans_indikator_id_fkey` FOREIGN KEY (`indikator_id`) REFERENCES `indikator_kinerja_utama` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `quarterly_action_plans` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `action_plan_id` INTEGER NOT NULL,
  `quarter` TINYINT NOT NULL,
  `target` DECIMAL(20, 6) NULL,
  `activity` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `quarterly_action_plans_action_plan_id_quarter_key` (`action_plan_id`, `quarter`),
  CONSTRAINT `quarterly_action_plans_action_plan_id_fkey` FOREIGN KEY (`action_plan_id`) REFERENCES `action_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
