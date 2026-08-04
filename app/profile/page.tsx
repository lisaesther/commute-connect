import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";
import { ProfileSetupHeader } from "@/components/profile/ProfileSetupHeader";
import { VehicleSetupForm } from "@/components/profile/VehicleSetupForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
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
        phone_e164,
        general_area,
        bio,
        organisation_name,
        work_email,
        organisation_verified_at,
        prefer_same_organisation,
        show_organisation,
        gender_identity,
        use_gender_for_matching,
        prefer_same_gender,
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
        accessibility_notes,
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
        <ProfileSetupHeader
          role={role}
          profileCompletedAt={profile?.profile_completed_at}
          hasVehicle={Boolean(vehicle)}
        />

        <ProfileSetupForm
          userId={user.id}
          email={user.email}
          hasLoadError={Boolean(
            profileError || vehicleError,
          )}
          initialProfile={{
            fullName,
            role,
            phone: profile?.phone_e164 || "",
            generalArea: profile?.general_area || "",
            bio: profile?.bio || "",
            organisationName:
              profile?.organisation_name || "",
            workEmail: profile?.work_email || "",
            organisationVerifiedAt:
              profile?.organisation_verified_at || null,
            preferSameOrganisation:
              profile?.prefer_same_organisation ?? false,
            showOrganisation:
              profile?.show_organisation ?? false,
            genderIdentity:
              profile?.gender_identity || "",
            useGenderForMatching:
              profile?.use_gender_for_matching ?? false,
            preferSameGender:
              profile?.prefer_same_gender ?? false,
            profileCompletedAt:
              profile?.profile_completed_at || null,
          }}
        />

        {role === "driver" || role === "both" ? (
          <VehicleSetupForm
            userId={user.id}
            initialVehicle={
              vehicle
                ? {
                    id: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    colour: vehicle.colour,
                    year: vehicle.year,
                    passengerSeats:
                      vehicle.passenger_seats,
                    accessibilityNotes:
                      vehicle.accessibility_notes || "",
                    driverDeclarationAcceptedAt:
                      vehicle.driver_declaration_accepted_at,
                  }
                : null
            }
          />
        ) : null}
      </section>
    </DashboardShell>
  );
}
