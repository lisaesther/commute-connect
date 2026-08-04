import Link from "next/link";

type DashboardHeaderProps = {
  fullName?: string;
  email?: string;
  role?: string;
};

const roleInformation: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  passenger: {
    label: "Passenger",
    description:
      "Search for suitable shared journeys and keep track of your seat requests.",
  },
  driver: {
    label: "Driver",
    description:
      "Post your regular commute and manage passengers who request a seat.",
  },
  both: {
    label: "Driver and passenger",
    description:
      "Find shared journeys, offer available seats, and manage your upcoming commutes.",
  },
};

export function DashboardHeader({
  fullName,
  email,
  role,
}: DashboardHeaderProps) {
  const displayName =
    fullName?.trim() || email?.split("@")[0] || "CommuteConnect user";

  const firstName = displayName.split(/\s+/)[0];

  const roleDetails = roleInformation[role || ""] || {
    label: "CommuteConnect member",
    description:
      "Manage your shared journeys, booking requests, and upcoming commutes.",
  };

  const isDriver = role === "driver";

  return (
    <header className="rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-lg sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Your dashboard
            </p>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {roleDetails.label}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            {roleDetails.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isDriver ? (
            <>
              <Link
                href="/journeys/new"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              >
                Post a Journey
              </Link>

              <Link
                href="/#journey-search"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white transition hover:border-slate-400 hover:bg-white/10"
              >
                Find a Ride
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/#journey-search"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              >
                Find a Ride
              </Link>

              <Link
                href="/journeys/new"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white transition hover:border-slate-400 hover:bg-white/10"
              >
                Post a Journey
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
