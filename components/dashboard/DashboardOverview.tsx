import Link from "next/link";

export type DashboardUpcomingJourney = {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  seatsOffered: number;
  suggestedContribution: number | null;
  status: string;
};

type DashboardOverviewProps = {
  role?: string;
  upcomingJourneys?: DashboardUpcomingJourney[];
};

function formatJourneyDate(
  departureAt: string,
) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      timeZone: "Europe/Dublin",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(departureAt));
}

function formatJourneyTime(
  departureAt: string,
) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      timeZone: "Europe/Dublin",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(departureAt));
}

function EmptyJourneyState({
  role,
}: {
  role?: string;
}) {
  const canOfferRides =
    role === "driver" || role === "both";

  return (
    <div className="rounded-xl bg-slate-50 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path d="M5 17h14" />
          <path d="m7 17-1 3" />
          <path d="m17 17 1 3" />
          <path d="M6 13h12l-1.5-5h-9L6 13Z" />
        </svg>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        No upcoming journeys
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {canOfferRides
          ? "Post your regular commute to offer available seats to passengers travelling in the same direction."
          : "Search available journeys to find a suitable shared commute."}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/#journey-search"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Find a Ride
        </Link>

        {canOfferRides ? (
          <Link
            href="/journeys/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Post a Journey
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function UpcomingJourneyList({
  journeys,
}: {
  journeys: DashboardUpcomingJourney[];
}) {
  return (
    <div className="space-y-4">
      {journeys.map((journey) => (
        <article
          key={journey.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800">
                  {journey.status}
                </span>

                <span className="text-sm font-semibold text-slate-600">
                  {formatJourneyDate(
                    journey.departureAt,
                  )}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
                {journey.origin}
                <span className="mx-2 text-slate-400">
                  →
                </span>
                {journey.destination}
              </h3>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span>
                  <strong className="font-semibold text-slate-800">
                    Time:
                  </strong>{" "}
                  {formatJourneyTime(
                    journey.departureAt,
                  )}
                </span>

                <span>
                  <strong className="font-semibold text-slate-800">
                    Seats:
                  </strong>{" "}
                  {journey.seatsOffered}
                </span>

                <span>
                  <strong className="font-semibold text-slate-800">
                    Contribution:
                  </strong>{" "}
                  {journey.suggestedContribution ===
                  null
                    ? "None"
                    : `€${journey.suggestedContribution.toFixed(
                        2,
                      )}`}
                </span>
              </div>
            </div>

            <Link
              href={`/journeys/${journey.id}`}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View Journey
            </Link>
          </div>
        </article>
      ))}

      <Link
        href="/journeys/new"
        className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
      >
        Post another journey
      </Link>
    </div>
  );
}

function EmptyRequestState({
  role,
}: {
  role?: string;
}) {
  const isDriver =
    role === "driver";
  const isPassenger =
    role === "passenger";

  let description =
    "Booking requests and driver responses that require your attention will appear here.";

  if (isDriver) {
    description =
      "When a passenger requests a seat on one of your posted journeys, the request will appear here.";
  }

  if (isPassenger) {
    description =
      "Your pending seat requests and driver responses will appear here.";
  }

  return (
    <div className="rounded-xl bg-slate-50 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path d="M8 12h8" />
          <path d="M8 16h5" />
          <path d="M6 3h12a2 2 0 0 1 2 2v14l-4-3H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        </svg>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        No pending requests
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export function DashboardOverview({
  role,
  upcomingJourneys = [],
}: DashboardOverviewProps) {
  const requestHeading =
    role === "driver"
      ? "Passenger requests"
      : role === "passenger"
        ? "My seat requests"
        : "Booking requests";

  return (
    <section
      aria-labelledby="dashboard-overview-heading"
      className="mt-8"
    >
      <h2
        id="dashboard-overview-heading"
        className="sr-only"
      >
        Journey and booking overview
      </h2>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Your travel
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Upcoming journeys
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your next open posted journeys and
              future shared travel will appear here.
            </p>
          </div>

          <div className="mt-6">
            {upcomingJourneys.length > 0 ? (
              <UpcomingJourneyList
                journeys={upcomingJourneys}
              />
            ) : (
              <EmptyJourneyState role={role} />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Requires attention
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {requestHeading}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review journey requests and
              booking-status updates.
            </p>
          </div>

          <div className="mt-6">
            <EmptyRequestState role={role} />
          </div>
        </article>
      </div>
    </section>
  );
}
