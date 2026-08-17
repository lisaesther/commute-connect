import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { JourneySearchForm } from "@/components/forms/JourneySearchForm";
import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
    seats?: string;
  }>;
};

export default async function JourneySearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

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

  return (
    <DashboardShell
      fullName={fullName}
      email={user.email}
      role={role}
    >
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Find a ride
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Search shared journeys
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Confirm your approximate origin and
            destination, then CommuteConnect will
            compare them with open journeys using
            geographic proximity and your preferred
            departure time.
          </p>
        </div>

        <JourneySearchForm
          initialOrigin={
            params.origin?.trim() ?? ""
          }
          initialDestination={
            params.destination?.trim() ?? ""
          }
          initialDate={params.date ?? ""}
          initialTime={params.time ?? ""}
          initialSeats={params.seats ?? "1"}
        />
      </div>
    </DashboardShell>
  );
}
