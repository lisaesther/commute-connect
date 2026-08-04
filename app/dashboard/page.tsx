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
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_primary", true)
    .eq("is_active", true)
    .maybeSingle();

  const metadataFullName =
    user.user_metadata?.full_name as string | undefined;

  const metadataRole =
    user.user_metadata?.role as string | undefined;

  const fullName =
    profile?.full_name ||
    metadataFullName ||
    "CommuteConnect user";

  const role =
    profile?.role ||
    metadataRole ||
    "passenger";

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

        <DashboardStats role={role} />

        <DashboardOverview role={role} />

        <DashboardSupport
          fullName={fullName}
          role={role}
          profileCompletedAt={
            profile?.profile_completed_at
          }
          hasVehicle={Boolean(vehicle)}
          hasLoadError={Boolean(
            profileError || vehicleError,
          )}
        />
      </section>
    </DashboardShell>
  );
}
