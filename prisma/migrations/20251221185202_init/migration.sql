/*
  Warnings:

  - You are about to drop the column `content` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `weekDiscarded` on the `UserStats` table. All the data in the column will be lost.
  - You are about to drop the column `weekKept` on the `UserStats` table. All the data in the column will be lost.
  - Added the required column `sourceData` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("itemId", "tagId"),
    CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "askedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIFollowUp_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIFollowUp" ("answer", "askedAt", "id", "itemId", "question") SELECT "answer", "askedAt", "id", "itemId", "question" FROM "AIFollowUp";
DROP TABLE "AIFollowUp";
ALTER TABLE "new_AIFollowUp" RENAME TO "AIFollowUp";
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceData" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedMinutes" INTEGER,
    "sourceId" TEXT,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userNote" TEXT,
    "aiSummary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "priorityScore" REAL NOT NULL DEFAULT 0,
    "readAt" DATETIME,
    "takeaway" TEXT,
    "takeawayAt" DATETIME,
    "verdict" TEXT,
    "verdictAt" DATETIME,
    "revisitCount" INTEGER NOT NULL DEFAULT 0,
    "revisitAfter" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("aiSummary", "createdAt", "description", "estimatedMinutes", "id", "priorityScore", "readAt", "revisitAfter", "revisitCount", "savedAt", "sourceId", "sourceType", "status", "takeaway", "takeawayAt", "title", "updatedAt", "userNote", "verdict", "verdictAt") SELECT "aiSummary", "createdAt", "description", "estimatedMinutes", "id", "priorityScore", "readAt", "revisitAfter", "revisitCount", "savedAt", "sourceId", "sourceType", "status", "takeaway", "takeawayAt", "title", "updatedAt", "userNote", "verdict", "verdictAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE TABLE "new_Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'daily',
    "maxPerFetch" INTEGER NOT NULL DEFAULT 3,
    "coldStartWindow" TEXT NOT NULL DEFAULT '30d',
    "topicFilter" TEXT,
    "topicFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoTags" TEXT NOT NULL DEFAULT '[]',
    "fetchedItemIds" TEXT NOT NULL DEFAULT '[]',
    "lastFetchedAt" DATETIME,
    "lastFetchStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastFetchError" TEXT,
    "itemsFetchedTotal" INTEGER NOT NULL DEFAULT 0,
    "itemsQueuedTotal" INTEGER NOT NULL DEFAULT 0,
    "itemsFilteredTotal" INTEGER NOT NULL DEFAULT 0,
    "lastFetchStats" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Source" ("autoTags", "coldStartWindow", "createdAt", "enabled", "fetchedItemIds", "id", "interval", "itemsFetchedTotal", "itemsFilteredTotal", "itemsQueuedTotal", "lastFetchError", "lastFetchStatus", "lastFetchedAt", "maxPerFetch", "name", "topicFilter", "topicFilterEnabled", "type", "url") SELECT "autoTags", "coldStartWindow", "createdAt", "enabled", "fetchedItemIds", "id", "interval", "itemsFetchedTotal", "itemsFilteredTotal", "itemsQueuedTotal", "lastFetchError", coalesce("lastFetchStatus", 'pending') AS "lastFetchStatus", "lastFetchedAt", "maxPerFetch", "name", "topicFilter", "topicFilterEnabled", "type", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
CREATE TABLE "new_UserStats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastVerdictDate" DATETIME,
    "totalKept" INTEGER NOT NULL DEFAULT 0,
    "totalDiscarded" INTEGER NOT NULL DEFAULT 0,
    "totalRevisited" INTEGER NOT NULL DEFAULT 0,
    "weekStartDate" DATETIME,
    "weeklyKept" INTEGER NOT NULL DEFAULT 0,
    "weeklyDiscarded" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserStats" ("currentStreak", "id", "lastVerdictDate", "longestStreak", "totalDiscarded", "totalKept", "totalRevisited", "updatedAt", "weekStartDate") SELECT "currentStreak", "id", "lastVerdictDate", "longestStreak", "totalDiscarded", "totalKept", "totalRevisited", "updatedAt", "weekStartDate" FROM "UserStats";
DROP TABLE "UserStats";
ALTER TABLE "new_UserStats" RENAME TO "UserStats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
