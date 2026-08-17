import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CancelJourneyButton } from "@/components/journeys/CancelJourneyButton";
import { createClient } from "@/lib/supabase/server";

type JourneyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const flexibilityLabels: Record<
  number,
  string
> = {
  0: "Exact departure time",
  15: "±15 minutes",
  30: "±30 minutes",
  60: "±60 minutes",
};

const luggageLabels: Record<
  string,
  string
> = {
  none: "No luggage space",
  small: "Small bag",
  medium: "Medium luggage",
  large: "Large luggage",
};

const petsLabels: Record<
  string,
  string
> = {
  no: "Pets not permitted",
  yes: "Pets permitted",
  ask: "Ask the driver",
};

function formatDeparture(
  departureAt: string,
) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      timeZone: "Europe/Dublin",
      dateStyle: "full",
      timeStyle: "short",
    },
  ).format(new Date(departureAt));
}

export default async function JourneyPage({
  params,
}: JourneyPageProps) {
  const { id } = await params;

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
        role
      `,
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      "Unable to load your profile.",
    );
  }

  const {
    data: journey,
    error: journeyError,
  } = await supabase
    .from("journeys")
    .select(
      `
        id,
        driver_id,
        vehicle_id,
        origin_name,
        destination_name,
        departure_at,
        departure_flexibility_minutes,
        seats_offered,
        suggested_contribution,
        luggage_preference,
        pets_preference,
        smoking_allowed,
        notes,
        status,
        created_at,
        updated_at,
        cancelled_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (journeyError) {
    throw new Error(
      "Unable to load this journey.",
    );
  }

  if (!journey) {
    notFound();
  }

  const [
    privateDetailsResult,
    vehicleResult,
  ] = await Promise.all([
    supabase
      .from("journey_private_details")
      .select(
        `
          pickup_details,
          dropoff_details
        `,
      )
      .eq("journey_id", journey.id)
      .maybeSingle(),

    supabase
      .from("vehicles")
      .select(
        `
          make,
          model,
          colour,
          year,
          passenger_seats
        `,
      )
      .eq("id", journey.vehicle_id)
      .maybeSingle(),
  ]);

  if (
    privateDetailsResult.error ||
    vehicleResult.error
  ) {
    throw new Error(
      "Unable to load complete journey details.",
    );
  }

  const metadataFullName =
    user.user_metadata?.full_name as
      | string
      | undefined;

  const metadataRole =
    user.user_metadata?.role as
      | string
      | undefined;

  const fullName =
    profile?.full_name ||
    metadataFullName ||
    "CommuteConnect user";

  const role =
    profile?.role ||
    metadataRole ||
    "passenger";

  const privateDetails =
    privateDetailsResult.data;

  const vehicle =
    vehicleResult.data;

  return (
    <DashboardShell
      fullName={fullName}
      email={user.email}
      role={role}
    >
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Posted journey
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {journey.origin_name}
              <span className="mx-3 text-slate-400">
                →
              </span>
              {journey.destination_name}
            </h1>

            <p className="mt-3 text-slate-600">
              Review the journey information
              currently stored by CommuteConnect.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              journey.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : journey.status === "completed"
                  ? "bg-slate-200 text-slate-700"
                  : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {journey.status}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Journey schedule
              </h2>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Departure
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDeparture(
                      journey.departure_at,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Time flexibility
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {flexibilityLabels[
                      journey
                        .departure_flexibility_minutes
                    ] ??
                      `${journey.departure_flexibility_minutes} minutes`}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Passenger seats
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {journey.seats_offered}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Suggested contribution
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {journey.suggested_contribution ===
                    null
                      ? "No contribution requested"
                      : `€${Number(
                          journey.suggested_contribution,
                        ).toFixed(2)}`}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Journey preferences
              </h2>

              <dl className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Luggage
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {luggageLabels[
                      journey.luggage_preference
                    ] ??
                      journey.luggage_preference}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Pets
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {petsLabels[
                      journey.pets_preference
                    ] ??
                      journey.pets_preference}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Smoking
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {journey.smoking_allowed
                      ? "Permitted"
                      : "Not permitted"}
                  </dd>
                </div>
              </dl>

              {journey.notes ? (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-medium text-slate-500">
                    Passenger notes
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {journey.notes}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-amber-950">
                Private coordination details
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                These details are private and are
                not part of ordinary passenger
                journey-search results.
              </p>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-sm font-medium text-amber-800">
                    Pickup instructions
                  </dt>

                  <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {privateDetails?.pickup_details ||
                      "No private pickup instructions provided."}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-amber-800">
                    Drop-off instructions
                  </dt>

                  <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {privateDetails?.dropoff_details ||
                      "No private drop-off instructions provided."}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Vehicle
              </p>

              {vehicle ? (
                <>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">
                    {vehicle.make}{" "}
                    {vehicle.model}
                  </h2>

                  <dl className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="inline font-medium text-slate-800">
                        Colour:
                      </dt>{" "}
                      <dd className="inline">
                        {vehicle.colour}
                      </dd>
                    </div>

                    {vehicle.year ? (
                      <div>
                        <dt className="inline font-medium text-slate-800">
                          Year:
                        </dt>{" "}
                        <dd className="inline">
                          {vehicle.year}
                        </dd>
                      </div>
                    ) : null}

                    <div>
                      <dt className="inline font-medium text-slate-800">
                        Vehicle capacity:
                      </dt>{" "}
                      <dd className="inline">
                        {
                          vehicle.passenger_seats
                        }
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Vehicle information is no
                  longer available.
                </p>
              )}
            </section>

            <section className="rounded-2xl bg-emerald-50 p-6">
              <h2 className="font-semibold text-emerald-950">
                Privacy
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Passengers will eventually receive
                only safe journey information
                before a booking is accepted.
              </p>
            </section>

            <div className="space-y-3">
              {journey.status === "open" ? (
                <CancelJourneyButton
                  journeyId={journey.id}
                />
              ) : null}

              <Link
                href="/journeys/new"
                className="block rounded-lg bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Post Another Journey
              </Link>

              <Link
                href="/dashboard"
                className="block rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
