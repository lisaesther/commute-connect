import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { JourneyPostForm } from "@/components/forms/JourneyPostForm";
import { createClient } from "@/lib/supabase/server";

type SetupNoticeProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

function SetupNotice({
  eyebrow,
  title,
  description,
  href,
  actionLabel,
}: SetupNoticeProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default async function NewJourneyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        role,
        profile_completed_at
      `,
    )
    .eq("id", user.id)
    .maybeSingle();

  const {
    data: vehicle,
    error: vehicleError,
  } = await supabase
    .from("vehicles")
    .select(
      `
        id,
        make,
        model,
        colour,
        year,
        passenger_seats,
        is_active,
        driver_declaration_accepted_at
      `,
    )
    .eq("owner_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const metadataFullName =
    user.user_metadata?.full_name as string | undefined;

  const metadataRole =
    user.user_metadata?.role as string | undefined;

  const fullName =
    profile?.full_name ||
    metadataFullName ||
    "CommuteConnect user";

  const displayRole =
    profile?.role ||
    metadataRole ||
    "passenger";

  const authoritativeRole = profile?.role;

  const canOfferRides =
    authoritativeRole === "driver" ||
    authoritativeRole === "both";

  const hasLoadError = Boolean(
    profileError || vehicleError,
  );

  let blocker: SetupNoticeProps | null = null;

  if (hasLoadError) {
    blocker = {
      eyebrow: "Unable to verify driver setup",
      title: "We could not confirm your posting eligibility",
      description:
        "CommuteConnect could not safely load your profile or vehicle information. No journey can be posted until your driver setup has been verified.",
      href: "/dashboard",
      actionLabel: "Return to Dashboard",
    };
  } else if (!profile) {
    blocker = {
      eyebrow: "Profile required",
      title: "Complete your profile before offering rides",
      description:
        "A complete CommuteConnect profile is required before you can post a journey.",
      href: "/profile",
      actionLabel: "Complete Profile",
    };
  } else if (!canOfferRides) {
    blocker = {
      eyebrow: "Driver access required",
      title: "Your account is currently set up for finding rides",
      description:
        "To offer a journey, update your profile preference to Driver or Driver and passenger, then complete the required driver setup.",
      href: "/profile",
      actionLabel: "Update Profile",
    };
  } else if (!profile.profile_completed_at) {
    blocker = {
      eyebrow: "Profile incomplete",
      title: "Finish your traveller profile",
      description:
        "Complete your basic profile information before posting a journey. This helps CommuteConnect maintain useful and accountable journey listings.",
      href: "/profile",
      actionLabel: "Complete Profile",
    };
  } else if (!vehicle) {
    blocker = {
      eyebrow: "Vehicle required",
      title: "Add a vehicle before offering a journey",
      description:
        "Drivers need an active vehicle with passenger capacity and an accepted driver declaration before posting a journey.",
      href: "/profile",
      actionLabel: "Add Vehicle",
    };
  } else if (!vehicle.is_active) {
    blocker = {
      eyebrow: "Vehicle inactive",
      title: "Your primary vehicle is not active",
      description:
        "An active vehicle is required before you can offer passenger seats on CommuteConnect.",
      href: "/profile",
      actionLabel: "Update Vehicle",
    };
  } else if (!vehicle.driver_declaration_accepted_at) {
    blocker = {
      eyebrow: "Driver setup incomplete",
      title: "Driver declaration required",
      description:
        "Accept the driver declaration in your vehicle setup before posting a journey.",
      href: "/profile",
      actionLabel: "Complete Driver Setup",
    };
  }

  return (
    <DashboardShell
      fullName={fullName}
      email={user.email}
      role={displayRole}
    >
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Driver journey posting
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Post a carpool journey
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
            Share an upcoming journey with other commuters. Your
            route, schedule, vehicle capacity and journey
            preferences will be used to help passengers find
            suitable rides.
          </p>
        </div>

        <div className="mt-8">
          {blocker ? (
            <SetupNotice {...blocker} />
          ) : vehicle ? (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <JourneyPostForm
                  vehicleId={vehicle.id}
                  passengerCapacity={vehicle.passenger_seats}
                />
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Journey vehicle
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-950">
                    {vehicle.make} {vehicle.model}
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">
                        Colour:
                      </span>{" "}
                      {vehicle.colour}
                    </p>

                    {vehicle.year ? (
                      <p>
                        <span className="font-medium text-slate-800">
                          Year:
                        </span>{" "}
                        {vehicle.year}
                      </p>
                    ) : null}

                    <p>
                      <span className="font-medium text-slate-800">
                        Passenger capacity:
                      </span>{" "}
                      {vehicle.passenger_seats}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-6">
                  <h2 className="font-semibold text-emerald-950">
                    Privacy reminder
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    Use an approximate public origin and destination.
                    Exact pickup and drop-off instructions will be
                    handled separately and kept private from ordinary
                    journey searches.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="block rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back to Dashboard
                </Link>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </DashboardShell>
  );
}
