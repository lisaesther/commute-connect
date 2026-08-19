type DashboardStatsProps = {
  role?: string;
  upcomingJourneys?: number;
  pendingRequests?: number;
  activeJourneys?: number;
  bookings?: number;
};

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};

function StatCard({
  label,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>

          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

export function DashboardStats({
  role,
  upcomingJourneys = 0,
  pendingRequests = 0,
  activeJourneys = 0,
  bookings = 0,
}: DashboardStatsProps) {
  const pendingLabel =
    role === "driver" || role === "both"
      ? "Passenger requests"
      : "Pending seat requests";

  const pendingDescription =
    role === "driver" || role === "both"
      ? "Passenger requests waiting for your response will appear here."
      : "Seat requests awaiting a driver response will appear here.";

  return (
    <section
      aria-labelledby="dashboard-summary-heading"
      className="mt-8"
    >
      <h2 id="dashboard-summary-heading" className="sr-only">
        Dashboard summary
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming journeys"
          value={upcomingJourneys}
          description={role === "driver" || role === "both" ? "Open journeys you have posted with a future departure." : "Accepted passenger journeys that have not yet taken place."}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M7 3v3" />
              <path d="M17 3v3" />
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
            </svg>
          }
        />

        <StatCard
          label={pendingLabel}
          value={pendingRequests}
          description={pendingDescription}
          icon={
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
          }
        />

        <StatCard
          label="Active posted journeys"
          value={activeJourneys}
          description={role === "driver" || role === "both" ? "Journey listings you currently have open." : "Journey posting activity will appear here if you offer rides."}
          icon={
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
              <circle cx="8" cy="14" r="1" />
              <circle cx="16" cy="14" r="1" />
            </svg>
          }
        />

        <StatCard
          label="My bookings"
          value={bookings}
          description="Your passenger booking requests and accepted seats."
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M8 7V3" />
              <path d="M16 7V3" />
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <path d="m8 14 2 2 5-5" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
