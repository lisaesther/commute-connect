import { BookingRequestButton } from "@/components/bookings/BookingRequestButton";
import type { JourneySearchResult } from "@/components/forms/JourneySearchForm";

type JourneyCardProps = {
  journey: JourneySearchResult;
  requestedSeats: number;
  canRequestSeats: boolean;
  bookingEligibilityMessage?: string;
};

const luggageLabels: Record<string, string> = {
  none: "No luggage space",
  small: "Small bag",
  medium: "Medium luggage",
  large: "Large luggage",
};

const petsLabels: Record<string, string> = {
  no: "Not permitted",
  yes: "Permitted",
  ask: "Ask driver",
};

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDeparture(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function JourneyCard({
  journey,
  requestedSeats,
  canRequestSeats,
  bookingEligibilityMessage,
}: JourneyCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700">
            Nearby route match
          </p>

          <h3 className="mt-2 text-xl font-semibold leading-7 text-slate-950">
            {journey.origin_name}
            <span className="mx-2 text-slate-400">→</span>
            {journey.destination_name}
          </h3>

          <p className="mt-3 text-sm text-slate-600">
            Driver:{" "}
            <span className="font-semibold text-slate-800">
              {journey.driver_name}
            </span>
          </p>

          <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Departure
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDeparture(journey.departure_at)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available seats
              </p>

              <p className="mt-1 font-semibold text-slate-950">
                {journey.available_seats}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Driver flexibility
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {journey.departure_flexibility_minutes === 0
                  ? "Exact departure"
                  : `±${journey.departure_flexibility_minutes} minutes`}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Origin proximity</p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDistance(journey.origin_distance_meters)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Destination proximity</p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDistance(journey.destination_distance_meters)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Preferred-time difference</p>

              <p className="mt-1 font-semibold text-slate-900">
                {journey.time_difference_minutes} min
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span>
              Luggage:{" "}
              <strong className="font-medium text-slate-800">
                {luggageLabels[journey.luggage_preference] ??
                  journey.luggage_preference}
              </strong>
            </span>

            <span>
              Pets:{" "}
              <strong className="font-medium text-slate-800">
                {petsLabels[journey.pets_preference] ?? journey.pets_preference}
              </strong>
            </span>

            <span>
              Smoking:{" "}
              <strong className="font-medium text-slate-800">
                {journey.smoking_allowed ? "Allowed" : "Not allowed"}
              </strong>
            </span>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-emerald-50 px-5 py-4 lg:min-w-48 lg:text-center">
          <p className="text-sm text-slate-600">Suggested contribution</p>

          <p className="mt-1 text-xl font-bold text-emerald-700">
            {journey.suggested_contribution === null
              ? "None"
              : `€${Number(journey.suggested_contribution).toFixed(2)}`}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <BookingRequestButton
          journeyId={journey.journey_id}
          requestedSeats={requestedSeats}
          canRequestSeats={canRequestSeats}
          eligibilityMessage={bookingEligibilityMessage}
        />

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Exact pickup and drop-off instructions remain private until an
          appropriate booking has been accepted.
        </p>
      </div>
    </article>
  );
}
