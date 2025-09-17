CREATE TABLE `Badge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mint` int NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int NOT NULL,
  `seed` decimal(65,30) NOT NULL DEFAULT '1.000000000000000000000000000000',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `rev` int NOT NULL DEFAULT '1',
  `season` int NOT NULL DEFAULT '1',
  `rank` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67282 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
