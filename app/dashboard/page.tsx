import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSupport } from "@/components/dashboard/DashboardSupport";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    profileResult,
    vehicleResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
          full_name,
          role,
          profile_completed_at
        `,
      )
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("vehicles")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_primary", true)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  const profile =
    profileResult.data;

  const vehicle =
    vehicleResult.data;

  const metadataFullName =
    user.user_metadata
      ?.full_name as
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

  const nowIso =
    new Date().toISOString();

  const [
    upcomingListResult,
    upcomingCountResult,
    activeCountResult,
  ] = await Promise.all([
    supabase
      .from("journeys")
      .select(
        `
          id,
          origin_name,
          destination_name,
          departure_at,
          seats_offered,
          suggested_contribution,
          status
        `,
      )
      .eq("driver_id", user.id)
      .eq("status", "open")
      .gt("departure_at", nowIso)
      .order("departure_at", {
        ascending: true,
      })
      .limit(3),

    supabase
      .from("journeys")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("driver_id", user.id)
      .eq("status", "open")
      .gt("departure_at", nowIso),

    supabase
      .from("journeys")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("driver_id", user.id)
      .eq("status", "open"),
  ]);

  if (
    upcomingListResult.error ||
    upcomingCountResult.error ||
    activeCountResult.error
  ) {
    throw new Error(
      "Unable to load dashboard journey information.",
    );
  }

  const upcomingJourneys =
    (
      upcomingListResult.data ?? []
    ).map((journey) => ({
      id: journey.id,
      origin: journey.origin_name,
      destination:
        journey.destination_name,
      departureAt:
        journey.departure_at,
      seatsOffered:
        journey.seats_offered,
      suggestedContribution:
        journey.suggested_contribution ===
        null
          ? null
          : Number(
              journey.suggested_contribution,
            ),
      status: journey.status,
    }));

  const upcomingJourneyCount =
    upcomingCountResult.count ?? 0;

  const activeJourneyCount =
    activeCountResult.count ?? 0;

  return (
    <DashboardShell
      fullName={fullName}
      email={user.email}
      role={role}
    >
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <DashboardHeader
          fullName={fullName}
          email={user.email}
          role={role}
        />

        <DashboardStats
          role={role}
          upcomingJourneys={
            upcomingJourneyCount
          }
          activeJourneys={
            activeJourneyCount
          }
          pendingRequests={0}
          bookings={0}
        />

        <DashboardOverview
          role={role}
          upcomingJourneys={
            upcomingJourneys
          }
        />

        <DashboardSupport
          fullName={fullName}
          role={role}
          profileCompletedAt={
            profile?.profile_completed_at
          }
          hasVehicle={Boolean(vehicle)}
          hasLoadError={Boolean(
            profileResult.error ||
              vehicleResult.error,
          )}
        />
      </section>
    </DashboardShell>
  );
}
