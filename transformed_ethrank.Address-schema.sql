CREATE TABLE "Address" (
  "id" SERIAL PRIMARY KEY,
  "address" varchar(255) NOT NULL,
  "score" int NOT NULL,
  "progress" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "imageUrl" text NOT NULL,
  "description" text NOT NULL,
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
) SERIAL=342759 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
