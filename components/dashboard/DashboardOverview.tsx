import Link from "next/link";

type DashboardOverviewProps = {
  role?: string;
};

function EmptyJourneyState({ role }: { role?: string }) {
  const isDriver = role === "driver";

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-7 w-7"
        >
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
        </svg>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        No upcoming journeys
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {isDriver
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

        <Link
          href="/journeys/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Post a Journey
        </Link>
      </div>
    </div>
  );
}

function EmptyRequestState({ role }: { role?: string }) {
  const isDriver = role === "driver";
  const isPassenger = role === "passenger";

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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-7 w-7"
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

export function DashboardOverview({ role }: DashboardOverviewProps) {
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
      <h2 id="dashboard-overview-heading" className="sr-only">
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
              Your next accepted or posted shared journeys will appear here.
            </p>
          </div>

          <div className="mt-6">
            <EmptyJourneyState role={role} />
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
              Review journey requests and booking-status updates.
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
