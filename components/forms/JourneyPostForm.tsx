"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LocationSearchField } from "@/components/geo/LocationSearchField";
import type { ConfirmedLocation } from "@/lib/geo/types";
import { createClient } from "@/lib/supabase/client";
import { irelandLocalDateTimeToIso } from "@/lib/time/ireland";
import {
  departureFlexibilityValues,
  journeySchema,
  luggagePreferenceValues,
  petsPreferenceValues,
  type JourneyFieldErrors,
  normaliseOptionalText,
  validateJourneySeatCapacity,
} from "@/lib/validation/journey";

type JourneyPostFormProps = {
  vehicleId: string;
  passengerCapacity: number;
};

const flexibilityLabels: Record<
  (typeof departureFlexibilityValues)[number],
  string
> = {
  "0": "Exact departure time",
  "15": "Flexible by ±15 minutes",
  "30": "Flexible by ±30 minutes",
  "60": "Flexible by ±60 minutes",
};

const luggageLabels: Record<
  (typeof luggagePreferenceValues)[number],
  string
> = {
  none: "No luggage space",
  small: "Small bag",
  medium: "Medium luggage",
  large: "Large luggage",
};

const petsLabels: Record<
  (typeof petsPreferenceValues)[number],
  string
> = {
  no: "Pets not permitted",
  yes: "Pets permitted",
  ask: "Ask the driver",
};

export function JourneyPostForm({
  vehicleId,
  passengerCapacity,
}: JourneyPostFormProps) {
  const [errors, setErrors] =
    useState<JourneyFieldErrors>({});

  const [message, setMessage] = useState("");

  const [submitError, setSubmitError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    createdJourneyId,
    setCreatedJourneyId,
  ] = useState<string | null>(null);

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [origin, setOrigin] =
    useState<ConfirmedLocation | null>(null);

  const [destination, setDestination] =
    useState<ConfirmedLocation | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting ||
      createdJourneyId
    ) {
      return;
    }

    const formData = new FormData(
      event.currentTarget,
    );

    const values = {
      originName: origin?.displayName ?? "",
      originLatitude:
        origin?.latitude ?? Number.NaN,
      originLongitude:
        origin?.longitude ?? Number.NaN,

      destinationName:
        destination?.displayName ?? "",
      destinationLatitude:
        destination?.latitude ?? Number.NaN,
      destinationLongitude:
        destination?.longitude ?? Number.NaN,

      departureDate: String(
        formData.get("departureDate") || "",
      ),

      departureTime: String(
        formData.get("departureTime") || "",
      ),

      departureFlexibilityMinutes: String(
        formData.get(
          "departureFlexibilityMinutes",
        ) || "0",
      ) as "0" | "15" | "30" | "60",

      seatsOffered: String(
        formData.get("seatsOffered") || "",
      ),

      suggestedContribution: String(
        formData.get(
          "suggestedContribution",
        ) || "",
      ),

      luggagePreference: String(
        formData.get("luggagePreference") ||
          "small",
      ) as "none" | "small" | "medium" | "large",

      petsPreference: String(
        formData.get("petsPreference") || "no",
      ) as "no" | "yes" | "ask",

      smokingAllowed:
        formData.get("smokingAllowed") ===
        "true",

      notes: String(
        formData.get("notes") || "",
      ),

      pickupDetails: String(
        formData.get("pickupDetails") || "",
      ),

      dropoffDetails: String(
        formData.get("dropoffDetails") || "",
      ),
    };

    const result =
      journeySchema.safeParse(values);

    if (!result.success) {
      setErrors(
        result.error.flatten().fieldErrors,
      );
      setMessage("");
      return;
    }

    const seatError =
      validateJourneySeatCapacity(
        result.data.seatsOffered,
        passengerCapacity,
      );

    if (seatError) {
      setErrors({
        seatsOffered: [seatError],
      });
      setMessage("");
      return;
    }

    const departureAt =
      irelandLocalDateTimeToIso(
        result.data.departureDate,
        result.data.departureTime,
      );

    if (!departureAt) {
      setErrors({
        departureTime: [
          "Choose a valid departure date and time in Ireland.",
        ],
      });
      setMessage("");
      return;
    }

    const suggestedContribution =
      result.data.suggestedContribution
        .trim() === ""
        ? null
        : Number(
            result.data
              .suggestedContribution,
          );

    setErrors({});
    setMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const {
        data: journeyId,
        error: createError,
      } = await supabase.rpc(
        "create_journey",
        {
          p_vehicle_id: vehicleId,

          p_origin_name:
            result.data.originName,
          p_origin_lat:
            result.data
              .originLatitude,
          p_origin_lng:
            result.data
              .originLongitude,

          p_destination_name:
            result.data
              .destinationName,
          p_destination_lat:
            result.data
              .destinationLatitude,
          p_destination_lng:
            result.data
              .destinationLongitude,

          p_departure_at:
            departureAt,

          p_departure_flexibility_minutes:
            Number(
              result.data
                .departureFlexibilityMinutes,
            ),

          p_seats_offered:
            Number(
              result.data.seatsOffered,
            ),

          p_suggested_contribution:
            suggestedContribution,

          p_luggage_preference:
            result.data
              .luggagePreference,

          p_pets_preference:
            result.data
              .petsPreference,

          p_smoking_allowed:
            result.data
              .smokingAllowed,

          p_notes:
            normaliseOptionalText(
              result.data.notes,
            ),

          p_pickup_details:
            normaliseOptionalText(
              result.data
                .pickupDetails,
            ),

          p_dropoff_details:
            normaliseOptionalText(
              result.data
                .dropoffDetails,
            ),
        },
      );

      if (createError) {
        throw createError;
      }

      if (
        typeof journeyId !==
          "string" ||
        !journeyId
      ) {
        throw new Error(
          "Journey creation did not return an identifier.",
        );
      }

      setCreatedJourneyId(
        journeyId,
      );

      setMessage(
        "Your journey has been posted successfully.",
      );
    } catch (error) {
      console.error(
        "Journey creation failed:",
        error instanceof Error
          ? error.message
          : "Unknown error",
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "";

      if (
        errorMessage.includes(
          "Journey departure must be in the future",
        )
      ) {
        setSubmitError(
          "The departure time has already passed. Choose a future departure time and try again.",
        );
      } else if (
        errorMessage.includes(
          "Seats offered cannot exceed",
        )
      ) {
        setSubmitError(
          "The selected number of seats exceeds your vehicle capacity.",
        );
      } else if (
        errorMessage.includes(
          "Complete your profile",
        ) ||
        errorMessage.includes(
          "Only users configured to offer rides",
        ) ||
        errorMessage.includes(
          "selected vehicle is not active",
        ) ||
        errorMessage.includes(
          "Driver declaration",
        )
      ) {
        setSubmitError(
          "Your driver setup is no longer ready for journey posting. Review your profile and vehicle before trying again.",
        );
      } else {
        setSubmitError(
          "We could not post your journey. Your journey has not been published. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section>
        <h2 className="text-xl font-semibold text-slate-950">
          Route
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose approximate public locations.
          Exact coordination information is
          collected separately below.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <LocationSearchField
            id="originSearch"
            label="From"
            placeholder="e.g. Tallaght"
            selectedLocation={origin}
            onLocationChange={(location) => {
              setOrigin(location);
              setMessage("");

              setErrors((current) => ({
                ...current,
                originName: undefined,
                originLatitude: undefined,
                originLongitude: undefined,
              }));
            }}
            error={errors.originName?.[0]}
          />

          <LocationSearchField
            id="destinationSearch"
            label="To"
            placeholder="e.g. Citywest"
            selectedLocation={destination}
            onLocationChange={(location) => {
              setDestination(location);
              setMessage("");

              setErrors((current) => ({
                ...current,
                destinationName: undefined,
                destinationLatitude: undefined,
                destinationLongitude: undefined,
              }));
            }}
            error={errors.destinationName?.[0]}
          />
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Schedule
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="departureDate"
              className="block text-sm font-medium text-slate-700"
            >
              Departure date
            </label>

            <input
              id="departureDate"
              name="departureDate"
              type="date"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {errors.departureDate ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.departureDate[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="departureTime"
              className="block text-sm font-medium text-slate-700"
            >
              Departure time
            </label>

            <input
              id="departureTime"
              name="departureTime"
              type="time"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {errors.departureTime ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.departureTime[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="departureFlexibilityMinutes"
            className="block text-sm font-medium text-slate-700"
          >
            Departure flexibility
          </label>

          <select
            id="departureFlexibilityMinutes"
            name="departureFlexibilityMinutes"
            defaultValue="0"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {departureFlexibilityValues.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {flexibilityLabels[value]}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Seats and cost sharing
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="seatsOffered"
              className="block text-sm font-medium text-slate-700"
            >
              Passenger seats offered
            </label>

            <select
              id="seatsOffered"
              name="seatsOffered"
              defaultValue="1"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {Array.from(
                {
                  length:
                    passengerCapacity,
                },
                (_, index) => index + 1,
              ).map((seatCount) => (
                <option
                  key={seatCount}
                  value={seatCount}
                >
                  {seatCount}{" "}
                  {seatCount === 1
                    ? "seat"
                    : "seats"}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Your vehicle supports up to{" "}
              {passengerCapacity} passenger{" "}
              {passengerCapacity === 1
                ? "seat"
                : "seats"}.
            </p>

            {errors.seatsOffered ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.seatsOffered[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="suggestedContribution"
              className="block text-sm font-medium text-slate-700"
            >
              Suggested contribution
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <div className="mt-2 flex rounded-lg border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
              <span className="flex items-center border-r border-slate-200 px-4 text-slate-500">
                €
              </span>

              <input
                id="suggestedContribution"
                name="suggestedContribution"
                type="number"
                min="0"
                max="100"
                step="0.50"
                placeholder="e.g. 5"
                className="min-w-0 flex-1 rounded-r-lg px-4 py-3 text-slate-900 outline-none"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Optional contribution toward shared
              journey costs.
            </p>

            {errors.suggestedContribution ? (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors
                    .suggestedContribution[0]
                }
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Journey preferences
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="luggagePreference"
              className="block text-sm font-medium text-slate-700"
            >
              Luggage space
            </label>

            <select
              id="luggagePreference"
              name="luggagePreference"
              defaultValue="small"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {luggagePreferenceValues.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {luggageLabels[value]}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="petsPreference"
              className="block text-sm font-medium text-slate-700"
            >
              Pets
            </label>

            <select
              id="petsPreference"
              name="petsPreference"
              defaultValue="no"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {petsPreferenceValues.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {petsLabels[value]}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700">
            Smoking
          </legend>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="radio"
                name="smokingAllowed"
                value="false"
                defaultChecked
              />
              <span className="text-sm text-slate-700">
                Smoking not permitted
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="radio"
                name="smokingAllowed"
                value="true"
              />
              <span className="text-sm text-slate-700">
                Smoking permitted
              </span>
            </label>
          </div>
        </fieldset>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Private coordination details
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          These details are stored separately from
          ordinary searchable journey information.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="pickupDetails"
              className="block text-sm font-medium text-slate-700"
            >
              Pickup instructions
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <textarea
              id="pickupDetails"
              name="pickupDetails"
              rows={3}
              maxLength={500}
              placeholder="e.g. Meet beside the main entrance near the taxi rank."
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {errors.pickupDetails ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.pickupDetails[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="dropoffDetails"
              className="block text-sm font-medium text-slate-700"
            >
              Drop-off instructions
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <textarea
              id="dropoffDetails"
              name="dropoffDetails"
              rows={3}
              maxLength={500}
              placeholder="e.g. I can drop passengers beside the main office entrance."
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {errors.dropoffDetails ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.dropoffDetails[0]}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700"
        >
          Notes for passengers
          <span className="ml-1 font-normal text-slate-500">
            (optional)
          </span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={500}
          placeholder="Add useful information about luggage, timing or the journey."
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Do not include phone numbers, exact home
          addresses or unnecessary sensitive personal
          information.
        </p>

        {errors.notes ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.notes[0]}
          </p>
        ) : null}
      </section>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <p className="text-sm font-semibold text-emerald-900">
            Journey posted
          </p>

          <p className="mt-1 text-sm text-emerald-800">
            {message}
          </p>

          {createdJourneyId ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/journeys/${createdJourneyId}`}
                className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                View Journey
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          Boolean(createdJourneyId)
        }
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createdJourneyId
          ? "Journey posted"
          : isSubmitting
            ? "Posting journey…"
            : "Post journey"}
      </button>
    </form>
  );
}
