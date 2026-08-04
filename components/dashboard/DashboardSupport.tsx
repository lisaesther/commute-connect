import Link from "next/link";

type DashboardSupportProps = {
  fullName?: string;
  role?: string;
  profileCompletedAt?: string | null;
  hasVehicle: boolean;
  hasLoadError?: boolean;
};

const roleLabels: Record<string, string> = {
  passenger: "Find rides",
  driver: "Offer rides",
  both: "Find and offer rides",
};

export function DashboardSupport({
  fullName,
  role,
  profileCompletedAt,
  hasVehicle,
  hasLoadError = false,
}: DashboardSupportProps) {
  const requiresVehicle = role === "driver" || role === "both";
  const basicProfileComplete = Boolean(profileCompletedAt);
  const driverSetupComplete = !requiresVehicle || hasVehicle;

  const profileReady =
    basicProfileComplete && driverSetupComplete;

  let statusLabel = "Setup required";
  let statusClassName = "bg-amber-100 text-amber-800";
  let heading = "Complete your traveller profile";
  let description =
    "Add your personal details and travel preferences to complete your CommuteConnect profile.";
  let actionLabel = "Complete Profile";
  let nextStep =
    "Add optional contact information, your general area, organisation details and matching preferences.";

  if (basicProfileComplete && !driverSetupComplete) {
    statusLabel = "Driver setup incomplete";
    statusClassName = "bg-amber-100 text-amber-800";
    heading = "Complete your driver setup";
    description =
      "Your basic profile is complete, but a primary vehicle is required before offering journeys.";
    actionLabel = "Add Vehicle";
    nextStep =
      "Add your vehicle details and accept the driver declaration before posting journeys.";
  }

  if (profileReady) {
    statusLabel = "Profile ready";
    statusClassName = "bg-emerald-100 text-emerald-800";
    heading = "Manage your traveller profile";
    description =
      "Your required profile setup is complete. Keep your information accurate as your travel needs change.";
    actionLabel = "Edit Profile";
    nextStep =
      "Review your details regularly and update your vehicle or travel preferences when needed.";
  }

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
          {hasLoadError ? (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
            >
              Some profile-readiness information could not be loaded.
              Open your Profile screen to review the current details.
            </div>
          ) : null}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Account setup
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {heading}
              </h2>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
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

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Basic profile
              </dt>

              <dd className="mt-2 text-sm font-semibold text-slate-900">
                {basicProfileComplete
                  ? "Completed"
                  : "Not completed"}
              </dd>
            </div>

            {requiresVehicle ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Driver setup
                </dt>

                <dd className="mt-2 text-sm font-semibold text-slate-900">
                  {hasVehicle
                    ? "Primary vehicle added"
                    : "Vehicle required"}
                </dd>
              </div>
            ) : null}
          </dl>

          <div
            className={`mt-6 rounded-xl border p-4 ${
              profileReady
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                profileReady
                  ? "text-emerald-900"
                  : "text-amber-950"
              }`}
            >
              {profileReady ? "Keep details current" : "Next step"}
            </p>

            <p
              className={`mt-2 text-sm leading-6 ${
                profileReady
                  ? "text-emerald-800"
                  : "text-amber-900"
              }`}
            >
              {nextStep}
            </p>
          </div>

          <Link
            href="/profile"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            {actionLabel}
          </Link>
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
            Meet in a public location, confirm journey and vehicle
            details, and report behaviour that makes you feel
            uncomfortable.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Exact pickup information remains private before
              acceptance.
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Confirm the driver, passenger, route and vehicle before
              travel.
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Never share passwords or unnecessary sensitive
              information.
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
