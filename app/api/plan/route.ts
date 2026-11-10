import { NextResponse } from "next/server";
import { z } from "zod";

const planSchema = z.object({
  studio: z.string().min(1),
  location: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().min(1),
  preferences: z.array(z.string()).min(1),
  maxWalkMinutes: z.number().int().min(1),
});

type PlaceCandidate = {
  placeId: string;
  name: string;
  address: string;
  categories: string[];
  distanceMeters: number | null;
  latitude?: number;
  longitude?: number;
};

function calculateEndTime(startTime: string, duration: number) {
  const [hours, minutes] = startTime.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + duration);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function geocodeLocation(location: string) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify API key is not configured");
  }

  const params = new URLSearchParams({
    text: location,
    format: "json",
    limit: "1",
    apiKey,
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params}`
  );

  if (!response.ok) {
    throw new Error("Geoapify geocoding request failed");
  }

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) {
    throw new Error("Location not found");
  }

  return {
    formattedAddress: result.formatted,
    latitude: result.lat,
    longitude: result.lon,
  };
}

function getCategoriesForPreferences(preferences: string[]) {
  const categoryMap: Record<string, string[]> = {
    Coffee: [
      "catering.cafe.coffee",
      "catering.cafe.coffee_shop",
      "commercial.food_and_drink.coffee_and_tea",
    ],
    Matcha: [
      "catering.cafe.tea",
      "commercial.food_and_drink.coffee_and_tea",
    ],
    Smoothie: [
      "catering.cafe",
      "commercial.food_and_drink.drinks",
    ],
    Juice: [
      "catering.cafe",
      "commercial.food_and_drink.drinks",
    ],
    Bakery: [
      "commercial.food_and_drink.bakery",
      "catering.cafe.cake",
    ],
    Brunch: [
      "catering.cafe",
      "catering.restaurant",
    ],
  };

  const categories = preferences.flatMap(
    (preference) => categoryMap[preference] ?? []
  );

  return [...new Set(categories)];
}

function getPreferenceScore(
  place: PlaceCandidate,
  preferences: string[]
) {
  const name = place.name.toLowerCase();

  const categories = place.categories.map((category) =>
    category.toLowerCase()
  );

  let score = 0;

  for (const preference of preferences) {
    const value = preference.toLowerCase();

    if (value === "coffee") {
      if (name.includes("coffee") || name.includes("cafe")) {
        score += 3;
      }

      if (
        categories.some(
          (category) =>
            category.includes("coffee") ||
            category.includes("cafe")
        )
      ) {
        score += 2;
      }
    }

    if (value === "matcha") {
      if (name.includes("matcha")) {
        score += 3;
      }

      if (
        categories.some(
          (category) =>
            category.includes("tea") ||
            category.includes("cafe")
        )
      ) {
        score += 2;
      }
    }

    if (value === "smoothie") {
      if (name.includes("smoothie")) {
        score += 3;
      }

      if (
        categories.some((category) =>
          category.includes("drinks")
        )
      ) {
        score += 2;
      }
    }

    if (value === "juice") {
      if (name.includes("juice")) {
        score += 3;
      }

      if (
        categories.some((category) =>
          category.includes("drinks")
        )
      ) {
        score += 2;
      }
    }

    if (value === "bakery") {
      if (
        name.includes("bakery") ||
        name.includes("bake") ||
        name.includes("pastry")
      ) {
        score += 3;
      }

      if (
        categories.some((category) =>
          category.includes("bakery")
        )
      ) {
        score += 2;
      }
    }

    if (value === "brunch") {
      if (
        name.includes("brunch") ||
        name.includes("breakfast")
      ) {
        score += 3;
      }

      if (
        categories.some(
          (category) =>
            category.includes("restaurant") ||
            category.includes("cafe")
        )
      ) {
        score += 1;
      }
    }
  }

  return score;
}

function getDistanceScore(distanceMeters: number | null) {
  if (distanceMeters === null) return 0;

  if (distanceMeters <= 300) return 5;
  if (distanceMeters <= 600) return 4;
  if (distanceMeters <= 900) return 3;
  if (distanceMeters <= 1200) return 2;

  return 1;
}

function getRecommendationReason(
  place: PlaceCandidate,
  preferences: string[],
  distanceMeters: number | null
) {
  const matchedPreference = preferences.find((preference) => {
    const value = preference.toLowerCase();
    const name = place.name.toLowerCase();
    const categories = place.categories.join(" ").toLowerCase();

    return name.includes(value) || categories.includes(value);
  });

  const walkingMinutes =
    distanceMeters === null
      ? null
      : Math.max(1, Math.round(distanceMeters / 80));

  if (matchedPreference && walkingMinutes !== null) {
    return `Strong ${matchedPreference.toLowerCase()} match · about ${walkingMinutes} min away`;
  }

  if (matchedPreference) {
    return `Strong ${matchedPreference.toLowerCase()} match`;
  }

  if (walkingMinutes !== null) {
    return `Nearby option · about ${walkingMinutes} min away`;
  }

  return "Matches your post-workout preferences";
}


async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  maxWalkMinutes: number,
  preferences: string[]
) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify API key is not configured");
  }

  const walkingMeters = maxWalkMinutes * 80;
  const categories = getCategoriesForPreferences(preferences);

  const params = new URLSearchParams({
    categories: categories.join(","),
    filter: `circle:${longitude},${latitude},${walkingMeters}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: "20",
    apiKey,
  });

  const response = await fetch(
    `https://api.geoapify.com/v2/places?${params}`
  );

  if (!response.ok) {
    throw new Error("Geoapify Places request failed");
  }

  const data = await response.json();

  const places: PlaceCandidate[] = data.features.map(
    (feature: {
      properties: {
        place_id: string;
        name?: string;
        formatted?: string;
        categories?: string[];
        distance?: number;
        lat?: number;
        lon?: number;
      };
    }) => ({
      placeId: feature.properties.place_id,
      name: feature.properties.name ?? "Unnamed place",
      address: feature.properties.formatted ?? "",
      categories: feature.properties.categories ?? [],
      distanceMeters: feature.properties.distance ?? null,
      latitude: feature.properties.lat,
      longitude: feature.properties.lon,
    })
  );

  return places
    .filter((place) => place.name !== "Unnamed place")
    .map((place) => {
        const preferenceScore = getPreferenceScore(
        place,
        preferences
        );

        const distanceScore = getDistanceScore(
        place.distanceMeters
        );

        const totalScore =
        preferenceScore * 2 + distanceScore;

        const recommendationReason = getRecommendationReason(
        place,
        preferences,
        place.distanceMeters
        );

        return {
        ...place,
        preferenceScore,
        distanceScore,
        totalScore,
        recommendationReason
        };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = planSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid planner data",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const classEndTime = calculateEndTime(
      result.data.startTime,
      result.data.duration
    );

    const location = await geocodeLocation(result.data.location);

    const places = await findNearbyPlaces(
      location.latitude,
      location.longitude,
      result.data.maxWalkMinutes,
      result.data.preferences
    );

    return NextResponse.json({
      plan: {
        ...result.data,
        classEndTime,
        location,
      },
      places,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 }
    );
  }
}