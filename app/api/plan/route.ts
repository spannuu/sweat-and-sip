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

    return NextResponse.json({
      plan: {
        ...result.data,
        classEndTime,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 }
    );
  }
}