"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type PassengerBookingRequestActionsProps = {
  bookingRequestId: string;
  bookingStatus: "pending" | "accepted";
  driverName: string;
  seatsRequested: number;
};

function seatLabel(value: number) {
  return `${value} ${value === 1 ? "seat" : "seats"}`;
}

function mapWithdrawalError(message: string) {
  const normalised = message.toLowerCase();

  if (normalised.includes("not available for withdrawal")) {
    return "This booking request is no longer available for withdrawal.";
  }

  if (normalised.includes("cannot be withdrawn in its current state")) {
    return "This booking request can no longer be withdrawn.";
  }

  if (normalised.includes("cannot be withdrawn after departure")) {
    return "This booking can no longer be withdrawn because the journey has already departed.";
  }

  if (normalised.includes("journey is not available")) {
    return "The associated journey is no longer available.";
  }

  return "We could not withdraw this booking request. Please try again.";
}

export function PassengerBookingRequestActions({
  bookingRequestId,
  bookingStatus,
  driverName,
  seatsRequested,
}: PassengerBookingRequestActionsProps) {
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [isConfirming, setIsConfirming] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const isAccepted = bookingStatus === "accepted";

  async function confirmWithdrawal() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.rpc("withdraw_booking_request", {
      p_booking_request_id: bookingRequestId,
    });

    if (error) {
      console.error("Booking withdrawal failed:", error.message);

      setMessage(mapWithdrawalError(error.message));

      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsConfirming(false);

    router.refresh();
  }

  if (isConfirming) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-slate-950">
          {isAccepted ? "Withdraw accepted booking?" : "Withdraw seat request?"}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {isAccepted ? (
            <>
              You currently have <strong>{seatLabel(seatsRequested)}</strong>{" "}
              accepted with <strong>{driverName}</strong>. Withdrawing will
              release these seats back to the journey.
            </>
          ) : (
            <>
              Withdraw your request for{" "}
              <strong>{seatLabel(seatsRequested)}</strong> from{" "}
              <strong>{driverName}</strong>? The driver will no longer be able
              to accept it.
            </>
          )}
        </p>

        <p className="mt-2 text-sm leading-6 text-red-700">
          This action will keep the booking record in the journey history but
          the request will not be active.
        </p>

        {message ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {message}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={confirmWithdrawal}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Withdrawing…"
              : isAccepted
                ? "Confirm withdrawal"
                : "Withdraw request"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsConfirming(false);
              setMessage("");
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          setIsConfirming(true);
          setMessage("");
        }}
        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        {isAccepted ? "Withdraw booking" : "Withdraw request"}
      </button>
    </div>
  );
}
