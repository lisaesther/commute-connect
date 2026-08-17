import { z } from "zod";

import type {
  LocationSearchResult,
} from "@/lib/geo/types";

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

const RESULT_LIMIT = 5;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MINIMUM_REQUEST_INTERVAL_MS = 1100;

const nominatimResultSchema = z.object({
  display_name: z.string().min(1),
  lat: z.string(),
  lon: z.string(),
  osm_type: z.string().nullish(),
  osm_id: z
    .union([z.string(), z.number()])
    .nullish(),
});

const nominatimResponseSchema = z.array(
  nominatimResultSchema,
);

type CachedLocationSearch = {
  expiresAt: number;
  results: LocationSearchResult[];
};

const searchCache = new Map<
  string,
  CachedLocationSearch
>();

let lastUpstreamRequestAt = 0;
let upstreamQueue: Promise<void> =
  Promise.resolve();

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function runWithinRateLimit<T>(
  task: () => Promise<T>,
): Promise<T> {
  let resolveResult:
    | ((value: T) => void)
    | undefined;

  let rejectResult:
    | ((reason?: unknown) => void)
    | undefined;

  const result = new Promise<T>(
    (resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    },
  );

  upstreamQueue = upstreamQueue
    .catch(() => undefined)
    .then(async () => {
      const elapsed =
        Date.now() - lastUpstreamRequestAt;

      const remainingDelay = Math.max(
        0,
        MINIMUM_REQUEST_INTERVAL_MS -
          elapsed,
      );

      if (remainingDelay > 0) {
        await wait(remainingDelay);
      }

      lastUpstreamRequestAt = Date.now();

      try {
        const value = await task();
        resolveResult?.(value);
      } catch (error) {
        rejectResult?.(error);
      }
    });

  return result;
}

function normaliseQuery(query: string) {
  return query.trim().replace(/\s+/g, " ");
}

function getCachedResults(
  query: string,
): LocationSearchResult[] | null {
  const cached = searchCache.get(query);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    searchCache.delete(query);
    return null;
  }

  return cached.results;
}

function parseResults(
  payload: unknown,
): LocationSearchResult[] {
  const parsed =
    nominatimResponseSchema.safeParse(
      payload,
    );

  if (!parsed.success) {
    throw new Error(
      "Unexpected response from geocoding provider.",
    );
  }

  return parsed.data
    .map((result) => {
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);

      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return null;
      }

      return {
        displayName: result.display_name,
        latitude,
        longitude,
        osmType:
          result.osm_type ?? null,
        osmId:
          result.osm_id == null
            ? null
            : String(result.osm_id),
      };
    })
    .filter(
      (
        result,
      ): result is LocationSearchResult =>
        result !== null,
    )
    .slice(0, RESULT_LIMIT);
}

export async function searchIrelandLocations(
  rawQuery: string,
): Promise<LocationSearchResult[]> {
  const query = normaliseQuery(rawQuery);

  if (query.length < 2) {
    throw new Error(
      "Location query is too short.",
    );
  }

  if (query.length > 120) {
    throw new Error(
      "Location query is too long.",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env
      .ALLOW_PUBLIC_NOMINATIM !== "true"
  ) {
    throw new Error(
      "Public Nominatim is disabled for production use.",
    );
  }

  const cacheKey = query.toLowerCase();

  const cached =
    getCachedResults(cacheKey);

  if (cached) {
    return cached;
  }

  const results = await runWithinRateLimit(
    async () => {
      const url = new URL(NOMINATIM_URL);

      url.searchParams.set("q", query);
      url.searchParams.set(
        "format",
        "jsonv2",
      );
      url.searchParams.set(
        "countrycodes",
        "ie",
      );
      url.searchParams.set(
        "limit",
        String(RESULT_LIMIT),
      );
      url.searchParams.set(
        "addressdetails",
        "0",
      );
      url.searchParams.set(
        "accept-language",
        "en",
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "CommuteConnectIreland/0.1 (academic project)",
        },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Geocoding provider returned ${response.status}.`,
        );
      }

      const payload: unknown =
        await response.json();

      return parseResults(payload);
    },
  );

  searchCache.set(cacheKey, {
    expiresAt:
      Date.now() + CACHE_TTL_MS,
    results,
  });

  return results;
}
