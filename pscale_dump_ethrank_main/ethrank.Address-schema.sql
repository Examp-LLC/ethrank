CREATE TABLE "Address" (
  "id" int NOT NULL AUTO_INCREMENT,
  "address" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "score" int NOT NULL,
  "progress" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "imageUrl" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "active" tinyint(1) NOT NULL DEFAULT '1',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  "season" int NOT NULL DEFAULT '1',
  "featured" tinyint(1) NOT NULL DEFAULT '0',
  "activeSince" datetime(3) DEFAULT NULL,
  "spentOnGas" decimal(65,30) DEFAULT NULL,
  "transactions" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "Address_address_season_score_idx" ("address","season","score")
) ENGINE=InnoDB AUTO_INCREMENT=342759 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
