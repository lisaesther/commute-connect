"use client";

import { useMemo, useState } from "react";

import { LocationSearchField } from "@/components/geo/LocationSearchField";
import { JourneyCard } from "@/components/journeys/JourneyCard";
import type { ConfirmedLocation } from "@/lib/geo/types";
import { createClient } from "@/lib/supabase/client";
import { irelandLocalDateTimeToIso } from "@/lib/time/ireland";

type JourneySearchFormProps = {
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialTime?: string;
  initialSeats?: string;
  canRequestSeats: boolean;
  bookingEligibilityMessage?: string;
};

export type JourneySearchResult = {
  journey_id: string;
  driver_name: string;
  origin_name: string;
  destination_name: string;
  departure_at: string;
  departure_flexibility_minutes: number;
  seats_offered: number;
  available_seats: number;
  suggested_contribution: number | null;
  luggage_preference: string;
  pets_preference: string;
  smoking_allowed: boolean;
  origin_distance_meters: number;
  destination_distance_meters: number;
  time_difference_minutes: number;
};

type SearchErrors = {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  seats?: string;
};

export function JourneySearchForm({
  initialOrigin = "",
  initialDestination = "",
  initialDate = "",
  initialTime = "",
  initialSeats = "1",
  canRequestSeats,
  bookingEligibilityMessage,
}: JourneySearchFormProps) {
  const supabase = useMemo(() => createClient(), []);

  const [origin, setOrigin] = useState<ConfirmedLocation | null>(null);

  const [destination, setDestination] = useState<ConfirmedLocation | null>(
    null,
  );

  const [date, setDate] = useState(initialDate);

  const [time, setTime] = useState(initialTime);

  const [seats, setSeats] = useState(
    ["1", "2", "3", "4", "5", "6", "7", "8"].includes(initialSeats)
      ? initialSeats
      : "1",
  );

  const [errors, setErrors] = useState<SearchErrors>({});

  const [results, setResults] = useState<JourneySearchResult[]>([]);

  const [hasSearched, setHasSearched] = useState(false);

  const [isSearching, setIsSearching] = useState(false);

  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    const nextErrors: SearchErrors = {};

    if (!origin) {
      nextErrors.origin = "Search for and confirm your starting location.";
    }

    if (!destination) {
      nextErrors.destination = "Search for and confirm your destination.";
    }

    if (!date) {
      nextErrors.date = "Choose your travel date.";
    }

    if (!time) {
      nextErrors.time = "Choose your preferred departure time.";
    }

    const seatsNeeded = Number(seats);

    if (!Number.isInteger(seatsNeeded) || seatsNeeded < 1 || seatsNeeded > 8) {
      nextErrors.seats = "Seats needed must be between 1 and 8.";
    }

    if (
      origin &&
      destination &&
      origin.latitude === destination.latitude &&
      origin.longitude === destination.longitude
    ) {
      nextErrors.destination = "Origin and destination must be different.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!origin || !destination) {
      return;
    }

    const preferredDeparture = irelandLocalDateTimeToIso(date, time);

    if (!preferredDeparture) {
      setErrors((current) => ({
        ...current,
        time: "Enter a valid future date and time for Ireland.",
      }));

      return;
    }

    if (new Date(preferredDeparture).getTime() <= Date.now()) {
      setErrors((current) => ({
        ...current,
        time: "Your preferred departure must be in the future.",
      }));

      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setResults([]);

    const { data, error } = await supabase.rpc("search_journeys", {
      p_origin_lat: origin.latitude,
      p_origin_lng: origin.longitude,
      p_destination_lat: destination.latitude,
      p_destination_lng: destination.longitude,
      p_preferred_departure: preferredDeparture,
      p_seats_needed: seatsNeeded,
    });

    if (error) {
      console.error("Journey search failed:", error.message);

      setMessage(
        "We could not search journeys right now. Please check your search and try again.",
      );

      setIsSearching(false);
      setHasSearched(true);
      return;
    }

    const safeResults = (data ?? []) as JourneySearchResult[];

    setResults(safeResults);
    setHasSearched(true);
    setIsSearching(false);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Route
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Confirm where you want to travel
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search for approximate public locations. The locations entered on
            the homepage are suggestions until you select a confirmed location
            result.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <LocationSearchField
            id="searchOrigin"
            label="From"
            placeholder="e.g. Tallaght"
            initialQuery={initialOrigin}
            selectedLocation={origin}
            onLocationChange={(location) => {
              setOrigin(location);
              setResults([]);
              setHasSearched(false);

              setErrors((current) => ({
                ...current,
                origin: undefined,
              }));
            }}
            error={errors.origin}
          />

          <LocationSearchField
            id="searchDestination"
            label="To"
            placeholder="e.g. Citywest"
            initialQuery={initialDestination}
            selectedLocation={destination}
            onLocationChange={(location) => {
              setDestination(location);
              setResults([]);
              setHasSearched(false);

              setErrors((current) => ({
                ...current,
                destination: undefined,
              }));
            }}
            error={errors.destination}
          />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Schedule
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="searchDate"
                className="block text-sm font-medium text-slate-700"
              >
                Travel date
              </label>

              <input
                id="searchDate"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setResults([]);
                  setHasSearched(false);

                  setErrors((current) => ({
                    ...current,
                    date: undefined,
                  }));
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              {errors.date ? (
                <p className="mt-2 text-sm text-red-600">{errors.date}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="searchTime"
                className="block text-sm font-medium text-slate-700"
              >
                Preferred time
              </label>

              <input
                id="searchTime"
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value);
                  setResults([]);
                  setHasSearched(false);

                  setErrors((current) => ({
                    ...current,
                    time: undefined,
                  }));
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                Matches within approximately ±60 minutes.
              </p>

              {errors.time ? (
                <p className="mt-2 text-sm text-red-600">{errors.time}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="searchSeats"
                className="block text-sm font-medium text-slate-700"
              >
                Seats needed
              </label>

              <select
                id="searchSeats"
                value={seats}
                onChange={(event) => {
                  setSeats(event.target.value);
                  setResults([]);
                  setHasSearched(false);

                  setErrors((current) => ({
                    ...current,
                    seats: undefined,
                  }));
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {Array.from({ length: 8 }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "seat" : "seats"}
                    </option>
                  ),
                )}
              </select>

              {errors.seats ? (
                <p className="mt-2 text-sm text-red-600">{errors.seats}</p>
              ) : null}
            </div>
          </div>
        </div>

        {message ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-8">
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? "Searching journeys…" : "Search journeys"}
          </button>
        </div>
      </form>

      {hasSearched ? (
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Matches
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {results.length} matching{" "}
                {results.length === 1 ? "journey" : "journeys"}
              </h2>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-5">
              {results.map((journey) => (
                <JourneyCard
                  key={journey.journey_id}
                  journey={journey}
                  requestedSeats={Number(seats)}
                  canRequestSeats={canRequestSeats}
                  bookingEligibilityMessage={bookingEligibilityMessage}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                No matching journeys
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                No open journeys currently match your confirmed locations,
                preferred time and requested seats. Try another time or nearby
                public location.
              </p>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
