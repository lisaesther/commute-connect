import type { NextRequest } from "next/server";

import {
  searchIrelandLocations,
} from "@/lib/geo/geocode";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      {
        error:
          "Authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  const query =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() ?? "";

  if (query.length < 2) {
    return Response.json(
      {
        error:
          "Enter at least 2 characters.",
      },
      {
        status: 400,
      },
    );
  }

  if (query.length > 120) {
    return Response.json(
      {
        error:
          "Location search must be 120 characters or fewer.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const results =
      await searchIrelandLocations(query);

    return Response.json({
      results,
    });
  } catch (error) {
    console.error(
      "Location geocoding failed:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return Response.json(
      {
        error:
          "Location search is temporarily unavailable. Please try again.",
      },
      {
        status: 502,
      },
    );
  }
}
