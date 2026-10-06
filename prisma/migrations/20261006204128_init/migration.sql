-- CreateEnum
CREATE TYPE "VenueCategory" AS ENUM ('COFFEE', 'MATCHA', 'SMOOTHIE', 'JUICE', 'BAKERY', 'BRUNCH');

-- CreateTable
CREATE TABLE "WorkoutClass" (
    "id" TEXT NOT NULL,
    "studio" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outing" (
    "id" TEXT NOT NULL,
    "workoutClassId" TEXT NOT NULL,
    "maxWalkMinutes" INTEGER NOT NULL,
    "venuePlaceId" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueCategory" "VenueCategory",
    "venueRating" DOUBLE PRECISION,
    "walkingMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutingPreference" (
    "id" TEXT NOT NULL,
    "category" "VenueCategory" NOT NULL,
    "outingId" TEXT NOT NULL,

    CONSTRAINT "OutingPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outing_workoutClassId_key" ON "Outing"("workoutClassId");

-- CreateIndex
CREATE UNIQUE INDEX "OutingPreference_outingId_category_key" ON "OutingPreference"("outingId", "category");

-- AddForeignKey
ALTER TABLE "Outing" ADD CONSTRAINT "Outing_workoutClassId_fkey" FOREIGN KEY ("workoutClassId") REFERENCES "WorkoutClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutingPreference" ADD CONSTRAINT "OutingPreference_outingId_fkey" FOREIGN KEY ("outingId") REFERENCES "Outing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
