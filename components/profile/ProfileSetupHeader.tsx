type ProfileSetupHeaderProps = {
  role?: string;
  profileCompletedAt?: string | null;
  hasVehicle: boolean;
};

const roleLabels: Record<string, string> = {
  passenger: "Passenger",
  driver: "Driver",
  both: "Driver and passenger",
};

export function ProfileSetupHeader({
  role,
  profileCompletedAt,
  hasVehicle,
}: ProfileSetupHeaderProps) {
  const requiresVehicle = role === "driver" || role === "both";
  const totalSteps = requiresVehicle ? 3 : 2;

  let completedSteps = 1;

  if (profileCompletedAt) {
    completedSteps += 1;
  }

  if (requiresVehicle && hasVehicle) {
    completedSteps += 1;
  }

  const progressPercentage = Math.round(
    (completedSteps / totalSteps) * 100,
  );

  const profileComplete =
    Boolean(profileCompletedAt) &&
    (!requiresVehicle || hasVehicle);

  return (
    <header className="rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-lg sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Profile setup
            </p>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {role ? roleLabels[role] || role : "CommuteConnect member"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {profileComplete
              ? "Manage your profile"
              : "Complete your traveller profile"}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Add the information required for safer communication, useful
            journey matching and responsible ride sharing.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-white">
              Setup progress
            </p>

            <p className="text-sm font-semibold text-emerald-300">
              {completedSteps} of {totalSteps}
            </p>
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"
            role="progressbar"
            aria-label="Profile setup progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
          >
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            {profileComplete
              ? "Your required profile setup is complete."
              : requiresVehicle
                ? "Complete your profile details and add a vehicle before offering journeys."
                : "Complete your personal and travel details to finish setup."}
          </p>
        </div>
      </div>
    </header>
  );
}
