-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "fileId" TEXT,
    "fileName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedMinutes" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '[]',
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

-- CreateTable
CREATE TABLE "Source" (
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
    "lastFetchStatus" TEXT,
    "lastFetchError" TEXT,
    "itemsFetchedTotal" INTEGER NOT NULL DEFAULT 0,
    "itemsQueuedTotal" INTEGER NOT NULL DEFAULT 0,
    "itemsFilteredTotal" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastVerdictDate" DATETIME,
    "totalKept" INTEGER NOT NULL DEFAULT 0,
    "totalDiscarded" INTEGER NOT NULL DEFAULT 0,
    "totalRevisited" INTEGER NOT NULL DEFAULT 0,
    "weekStartDate" DATETIME,
    "weekKept" INTEGER NOT NULL DEFAULT 0,
    "weekDiscarded" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "askedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIFollowUp_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_url_key" ON "Item"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
