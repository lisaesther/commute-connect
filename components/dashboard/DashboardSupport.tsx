import Link from "next/link";

type DashboardSupportProps = {
  fullName?: string;
  role?: string;
};

const roleLabels: Record<string, string> = {
  passenger: "Find rides",
  driver: "Offer rides",
  both: "Find and offer rides",
};

export function DashboardSupport({
  fullName,
  role,
}: DashboardSupportProps) {
  const hasBasicDetails = Boolean(fullName && role);
  const requiresVehicle = role === "driver" || role === "both";

  return (
    <section
      aria-labelledby="dashboard-support-heading"
      className="mt-8"
    >
      <h2 id="dashboard-support-heading" className="sr-only">
        Profile and safety information
      </h2>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Account setup
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Complete your traveller profile
              </h2>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                hasBasicDetails
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {hasBasicDetails
                ? "Basic account ready"
                : "Setup required"}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Your account is active. Additional profile information will help
            improve trust, journey matching, and communication between
            commuters.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </dt>

              <dd className="mt-2 text-sm font-semibold text-slate-900">
                {fullName || "Not provided"}
              </dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Travel preference
              </dt>

              <dd className="mt-2 text-sm font-semibold text-slate-900">
                {role ? roleLabels[role] || role : "Not selected"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">
              Details to add
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Organisation, optional phone number, travel preferences
              {requiresVehicle
                ? ", and vehicle information for offering rides."
                : "."}
            </p>
          </div>
        </article>

        <article className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path d="M12 3 5 6v5c0 4.6 2.9 8.7 7 10 4.1-1.3 7-5.4 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Safety first
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Share journeys responsibly
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            Meet in a public location, confirm journey and vehicle details, and
            report any behaviour that makes you feel uncomfortable.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Exact pickup information remains private before acceptance.
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Confirm the driver, passenger, route and vehicle before travel.
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Never share passwords or unnecessary sensitive information.
            </li>
          </ul>

          <Link
            href="/#safety"
            className="mt-7 inline-flex items-center font-semibold text-emerald-300 transition hover:text-emerald-200 hover:underline"
          >
            Read safety information
          </Link>
        </article>
      </div>
    </section>
  );
}
