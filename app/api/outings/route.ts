import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VenueCategory } from "@/lib/generated/prisma/enums";

const outingSchema = z.object({
  studio: z.string().min(1),
  locationName: z.string().min(1),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),

  preferences: z.array(
    z.enum([
      "Coffee",
      "Matcha",
      "Smoothie",
      "Juice",
      "Bakery",
      "Brunch",
    ])
  ),

  maxWalkMinutes: z.number().int().positive(),

  venue: z.object({
    placeId: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(1),
    walkingMinutes: z.number().int().positive().nullable(),
  }),
});

const preferenceMap: Record<
  string,
  VenueCategory
> = {
  Coffee: VenueCategory.COFFEE,
  Matcha: VenueCategory.MATCHA,
  Smoothie: VenueCategory.SMOOTHIE,
  Juice: VenueCategory.JUICE,
  Bakery: VenueCategory.BAKERY,
  Brunch: VenueCategory.BRUNCH,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = outingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid outing data",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = result.data;

    const workoutClass = await prisma.workoutClass.create({
      data: {
        studio: data.studio,
        locationName: data.locationName,
        startsAt: new Date(data.startsAt),
        durationMinutes: data.durationMinutes,

        outing: {
          create: {
            maxWalkMinutes: data.maxWalkMinutes,

            venuePlaceId: data.venue.placeId,
            venueName: data.venue.name,
            venueAddress: data.venue.address,
            walkingMinutes: data.venue.walkingMinutes,

            preferences: {
              create: data.preferences.map((preference) => ({
                category: preferenceMap[preference],
              })),
            },
          },
        },
      },

      include: {
        outing: {
          include: {
            preferences: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Outing saved",
        workoutClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to save outing" },
      { status: 500 }
    );
  }
}