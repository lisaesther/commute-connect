import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  DashboardOverview,
  type DashboardBookingRequest,
} from "@/components/dashboard/DashboardOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSupport } from "@/components/dashboard/DashboardSupport";
import type {
  PassengerBookingStatus,
  PassengerBookingSummary,
} from "@/components/bookings/PassengerBookingList";
import { createClient } from "@/lib/supabase/server";

type DriverBookingRequestRpcRow = {
  booking_request_id: string;
  journey_id: string;
  passenger_name: string;
  origin_name: string;
  destination_name: string;
  departure_at: string;
  seats_requested: number;
  booking_status: string;
  journey_status: string;
  requested_at: string;
  responded_at: string | null;
};

type PassengerBookingRpcRow = {
  booking_request_id: string;
  journey_id: string;
  driver_name: string;
  origin_name: string;
  destination_name: string;
  departure_at: string;
  seats_requested: number;
  booking_status: string;
  journey_status: string;
  suggested_contribution:
    | number
    | string
    | null;
  requested_at: string;
  responded_at: string | null;
  withdrawn_at: string | null;
  pickup_details: string | null;
  dropoff_details: string | null;
};

function isPassengerBookingStatus(
  value: string,
): value is PassengerBookingStatus {
  return (
    value === "pending" ||
    value === "accepted" ||
    value === "declined" ||
    value === "withdrawn"
  );
}

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

  const authoritativeRole =
    profile?.role ?? null;

  const canManageBookingRequests =
    authoritativeRole === "driver" ||
    authoritativeRole === "both";

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

  let bookingRequests:
    DashboardBookingRequest[] = [];

  let pendingRequestCount = 0;

  if (canManageBookingRequests) {
    const {
      data: bookingRequestData,
      error: bookingRequestError,
    } = await supabase.rpc(
      "get_driver_booking_requests",
    );

    if (bookingRequestError) {
      throw new Error(
        "Unable to load passenger booking requests.",
      );
    }

    const allBookingRequests =
      (
        (bookingRequestData ?? []) as
          DriverBookingRequestRpcRow[]
      ).map((request) => {
        const canRespond =
          request.booking_status ===
            "pending" &&
          request.journey_status ===
            "open" &&
          Date.parse(
            request.departure_at,
          ) > Date.parse(nowIso);

        return {
          bookingRequestId:
            request.booking_request_id,
          journeyId:
            request.journey_id,
          passengerName:
            request.passenger_name,
          origin:
            request.origin_name,
          destination:
            request.destination_name,
          departureAt:
            request.departure_at,
          seatsRequested:
            request.seats_requested,
          bookingStatus:
            request.booking_status,
          journeyStatus:
            request.journey_status,
          requestedAt:
            request.requested_at,
          respondedAt:
            request.responded_at,
          canRespond,
        };
      });

    pendingRequestCount =
      allBookingRequests.filter(
        (request) =>
          request.bookingStatus ===
            "pending" &&
          request.canRespond,
      ).length;

    bookingRequests =
      allBookingRequests.slice(0, 5);
  }

  const {
    data: passengerBookingData,
    error: passengerBookingError,
  } = await supabase.rpc(
    "get_passenger_bookings",
  );

  if (passengerBookingError) {
    throw new Error(
      "Unable to load your passenger bookings.",
    );
  }

  const passengerBookingRows =
    (passengerBookingData ?? []) as
      PassengerBookingRpcRow[];

  const passengerBookings:
    PassengerBookingSummary[] =
    passengerBookingRows.map(
      (booking) => {
        if (
          !isPassengerBookingStatus(
            booking.booking_status,
          )
        ) {
          throw new Error(
            "Unsupported passenger booking status.",
          );
        }

        const suggestedContribution =
          booking.suggested_contribution ===
          null
            ? null
            : Number(
                booking.suggested_contribution,
              );

        if (
          suggestedContribution !== null &&
          !Number.isFinite(
            suggestedContribution,
          )
        ) {
          throw new Error(
            "Invalid booking contribution value.",
          );
        }

        const departureIsFuture =
          Date.parse(
            booking.departure_at,
          ) > Date.parse(nowIso);

        return {
          bookingRequestId:
            booking.booking_request_id,
          journeyId:
            booking.journey_id,
          driverName:
            booking.driver_name,
          origin:
            booking.origin_name,
          destination:
            booking.destination_name,
          departureAt:
            booking.departure_at,
          seatsRequested:
            booking.seats_requested,
          bookingStatus:
            booking.booking_status,
          journeyStatus:
            booking.journey_status,
          suggestedContribution,
          requestedAt:
            booking.requested_at,
          respondedAt:
            booking.responded_at,
          withdrawnAt:
            booking.withdrawn_at,
          pickupDetails:
            booking.pickup_details,
          dropoffDetails:
            booking.dropoff_details,
          canWithdraw:
            (
              booking.booking_status ===
                "pending" ||
              booking.booking_status ===
                "accepted"
            ) &&
            departureIsFuture,
        };
      },
    );

  const activePassengerBookingCount =
    passengerBookings.filter(
      (booking) =>
        (
          booking.bookingStatus ===
            "pending" ||
          booking.bookingStatus ===
            "accepted"
        ) &&
        booking.journeyStatus ===
          "open" &&
        Date.parse(
          booking.departureAt,
        ) > Date.parse(nowIso),
    ).length;

  const pendingPassengerBookingCount =
    passengerBookings.filter(
      (booking) =>
        booking.bookingStatus ===
          "pending" &&
        booking.journeyStatus ===
          "open" &&
        Date.parse(
          booking.departureAt,
        ) > Date.parse(nowIso),
    ).length;

  const acceptedPassengerJourneyCount =
    passengerBookings.filter(
      (booking) =>
        booking.bookingStatus ===
          "accepted" &&
        booking.journeyStatus ===
          "open" &&
        Date.parse(
          booking.departureAt,
        ) > Date.parse(nowIso),
    ).length;

  const dashboardUpcomingJourneyCount =
    canManageBookingRequests
      ? upcomingJourneyCount
      : acceptedPassengerJourneyCount;

  const dashboardPendingRequestCount =
    canManageBookingRequests
      ? pendingRequestCount
      : pendingPassengerBookingCount;

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
            dashboardUpcomingJourneyCount
          }
          activeJourneys={
            activeJourneyCount
          }
          pendingRequests={
            dashboardPendingRequestCount
          }
          bookings={
            activePassengerBookingCount
          }
        />

        <DashboardOverview
          role={role}
          upcomingJourneys={
            upcomingJourneys
          }
          bookingRequests={
            bookingRequests
          }
          passengerBookings={
            passengerBookings.slice(0, 5)
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
