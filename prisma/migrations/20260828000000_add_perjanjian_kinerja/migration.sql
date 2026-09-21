CREATE TABLE `perjanjian_kinerja` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `timeline_pelaksanaan` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sasaran_kegiatan` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `perjanjian_id` INTEGER NOT NULL,
  `nama_sasaran` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `sasaran_kegiatan_perjanjian_id_idx` (`perjanjian_id`),
  CONSTRAINT `sasaran_kegiatan_perjanjian_id_fkey` FOREIGN KEY (`perjanjian_id`) REFERENCES `perjanjian_kinerja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `indikator_kinerja_utama` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sasaran_id` INTEGER NOT NULL,
  `nama_iku` TEXT NOT NULL,
  `satuan` VARCHAR(100) NOT NULL,
  `target` DECIMAL(20, 6) NULL,
  `pic_id` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `indikator_kinerja_utama_sasaran_id_idx` (`sasaran_id`),
  INDEX `indikator_kinerja_utama_pic_id_idx` (`pic_id`),
  CONSTRAINT `indikator_kinerja_utama_sasaran_id_fkey` FOREIGN KEY (`sasaran_id`) REFERENCES `sasaran_kegiatan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `indikator_kinerja_utama_pic_id_fkey` FOREIGN KEY (`pic_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
