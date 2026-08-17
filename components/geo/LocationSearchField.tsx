"use client";

import { useState } from "react";

import type {
  ConfirmedLocation,
  LocationSearchResult,
} from "@/lib/geo/types";

type LocationSearchFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  selectedLocation:
    | ConfirmedLocation
    | null;
  onLocationChange: (
    location: ConfirmedLocation | null,
  ) => void;
  error?: string;
};

type GeocodeResponse = {
  results?: LocationSearchResult[];
  error?: string;
};

export function LocationSearchField({
  id,
  label,
  placeholder,
  selectedLocation,
  onLocationChange,
  error,
}: LocationSearchFieldProps) {
  const [query, setQuery] =
    useState(
      selectedLocation?.displayName ?? "",
    );

  const [results, setResults] = useState<
    LocationSearchResult[]
  >([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  function handleQueryChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setQuery(event.target.value);
    setResults([]);
    setSearchError("");

    if (selectedLocation) {
      onLocationChange(null);
    }
  }

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSearchError(
        "Enter at least 2 characters.",
      );
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setResults([]);

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(
          trimmedQuery,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      const payload =
        (await response.json()) as
          GeocodeResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Location search failed.",
        );
      }

      const searchResults =
        payload.results ?? [];

      setResults(searchResults);

      if (searchResults.length === 0) {
        setSearchError(
          "No matching locations were found in Ireland. Try a town, area or landmark.",
        );
      }
    } catch (searchFailure) {
      setSearchError(
        searchFailure instanceof Error
          ? searchFailure.message
          : "Location search is temporarily unavailable.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function selectLocation(
    result: LocationSearchResult,
  ) {
    const confirmedLocation = {
      displayName: result.displayName,
      latitude: result.latitude,
      longitude: result.longitude,
    };

    setQuery(result.displayName);
    setResults([]);
    setSearchError("");
    onLocationChange(confirmedLocation);
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          maxLength={120}
          autoComplete="off"
          aria-describedby={`${id}-help`}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={
            isSearching ||
            query.trim().length < 2
          }
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching
            ? "Searching…"
            : "Search"}
        </button>
      </div>

      <p
        id={`${id}-help`}
        className="mt-2 text-xs leading-5 text-slate-500"
      >
        Search for an approximate area,
        town or public landmark in Ireland.
      </p>

      {selectedLocation ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            ✓ Location confirmed
          </p>

          <p className="mt-1 text-sm leading-5 text-emerald-800">
            {selectedLocation.displayName}
          </p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white">
          <p className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Select the correct location
          </p>

          <ul>
            {results.map(
              (result, index) => (
                <li
                  key={`${result.osmType ?? "place"}-${result.osmId ?? index}-${result.latitude}-${result.longitude}`}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      selectLocation(
                        result,
                      )
                    }
                    className="w-full px-4 py-3 text-left text-sm leading-5 text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    {
                      result.displayName
                    }
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      <div aria-live="polite">
        {searchError ? (
          <p className="mt-2 text-sm text-red-600">
            {searchError}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-slate-400">
        Location data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-600"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
