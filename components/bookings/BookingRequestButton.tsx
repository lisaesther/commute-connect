"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type BookingRequestButtonProps = {
  journeyId: string;
  requestedSeats: number;
  canRequestSeats: boolean;
  eligibilityMessage?: string;
};

function seatLabel(value: number) {
  return `${value} ${value === 1 ? "seat" : "seats"}`;
}

function mapBookingError(message: string) {
  const normalised = message.toLowerCase();

  if (normalised.includes("already have an active request")) {
    return "You already have an active request for this journey.";
  }

  if (normalised.includes("not enough seats remain")) {
    return "There are no longer enough seats for this request. Search again to see the latest availability.";
  }

  if (normalised.includes("cannot request seats on your own journey")) {
    return "You cannot request seats on your own journey.";
  }

  if (
    normalised.includes("complete your profile") ||
    normalised.includes("completed passenger profile")
  ) {
    return "Complete your traveller profile before requesting seats.";
  }

  if (normalised.includes("not enabled for requesting rides")) {
    return "Your current profile is not enabled for passenger seat requests.";
  }

  if (normalised.includes("journey is not available for booking")) {
    return "This journey is no longer available for booking.";
  }

  return "We could not send your seat request. Please try again.";
}

export function BookingRequestButton({
  journeyId,
  requestedSeats,
  canRequestSeats,
  eligibilityMessage,
}: BookingRequestButtonProps) {
  const supabase = useMemo(() => createClient(), []);

  const [isConfirming, setIsConfirming] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestCreated, setRequestCreated] = useState(false);

  const [message, setMessage] = useState("");

  async function confirmRequest() {
    if (isSubmitting || requestCreated) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.rpc("create_booking_request", {
      p_journey_id: journeyId,
      p_seats_requested: requestedSeats,
    });

    if (error) {
      console.error("Booking request failed:", error.message);

      setMessage(mapBookingError(error.message));

      setIsSubmitting(false);
      return;
    }

    setRequestCreated(true);
    setIsConfirming(false);
    setIsSubmitting(false);
  }

  if (!canRequestSeats) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          Seat requests are unavailable
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {eligibilityMessage ??
            "Your traveller profile is not currently eligible to request seats."}
        </p>

        <Link
          href="/profile"
          className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Review profile
        </Link>
      </div>
    );
  }

  if (requestCreated) {
    return (
      <div
        aria-live="polite"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
      >
        <p className="font-semibold text-emerald-900">✓ Seat request sent</p>

        <p className="mt-1 text-sm text-emerald-800">
          Requested: {seatLabel(requestedSeats)}
        </p>

        <p className="mt-1 text-sm text-emerald-800">Status: Pending</p>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          The driver can now review your request.
        </p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-semibold text-amber-950">Confirm seat request</p>

        <p className="mt-2 text-sm leading-6 text-amber-900">
          You are requesting <strong>{seatLabel(requestedSeats)}</strong> on
          this journey. The request will be pending until the driver responds.
        </p>

        {message ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {message}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={confirmRequest}
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending request…" : "Confirm request"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsConfirming(false);
              setMessage("");
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setIsConfirming(true);
          setMessage("");
        }}
        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Request {seatLabel(requestedSeats)}
      </button>

      {message ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
