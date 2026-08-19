"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type BookingResponse =
  | "accepted"
  | "declined";

type DriverBookingRequestActionsProps = {
  bookingRequestId: string;
  passengerName: string;
  seatsRequested: number;
};

function seatLabel(value: number) {
  return `${value} ${value === 1 ? "seat" : "seats"}`;
}

function mapResponseError(message: string) {
  const normalised = message.toLowerCase();

  if (
    normalised.includes(
      "already been resolved",
    )
  ) {
    return "This booking request has already been resolved.";
  }

  if (
    normalised.includes(
      "another driver's booking request",
    )
  ) {
    return "You cannot respond to this booking request.";
  }

  if (
    normalised.includes(
      "journey is no longer available",
    )
  ) {
    return "This journey is no longer open for booking responses.";
  }

  if (
    normalised.includes(
      "not enough seats remain",
    )
  ) {
    return "There are no longer enough seats to accept this request.";
  }

  return "We could not update this booking request. Please try again.";
}

export function DriverBookingRequestActions({
  bookingRequestId,
  passengerName,
  seatsRequested,
}: DriverBookingRequestActionsProps) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [
    pendingResponse,
    setPendingResponse,
  ] = useState<BookingResponse | null>(
    null,
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  async function confirmResponse() {
    if (
      !pendingResponse ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.rpc(
      "respond_to_booking_request",
      {
        p_booking_request_id:
          bookingRequestId,
        p_response: pendingResponse,
      },
    );

    if (error) {
      console.error(
        "Booking response failed:",
        error.message,
      );

      setMessage(
        mapResponseError(error.message),
      );

      setIsSubmitting(false);
      return;
    }

    setPendingResponse(null);
    setIsSubmitting(false);

    router.refresh();
  }

  if (pendingResponse) {
    const accepting =
      pendingResponse === "accepted";

    return (
      <div
        className={`mt-4 rounded-xl border p-4 ${
          accepting
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <p className="font-semibold text-slate-950">
          {accepting
            ? "Accept seat request?"
            : "Decline seat request?"}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {accepting ? (
            <>
              Confirm{" "}
              <strong>
                {seatLabel(
                  seatsRequested,
                )}
              </strong>{" "}
              for{" "}
              <strong>
                {passengerName}
              </strong>
              .
            </>
          ) : (
            <>
              Decline the request from{" "}
              <strong>
                {passengerName}
              </strong>{" "}
              for{" "}
              <strong>
                {seatLabel(
                  seatsRequested,
                )}
              </strong>
              .
            </>
          )}
        </p>

        {message ? (
          <p
            role="alert"
            className="mt-3 text-sm font-medium text-red-700"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={confirmResponse}
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              accepting
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting
              ? "Updating…"
              : accepting
                ? "Confirm acceptance"
                : "Confirm decline"}
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingResponse(null);
              setMessage("");
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => {
          setPendingResponse(
            "accepted",
          );
          setMessage("");
        }}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Accept
      </button>

      <button
        type="button"
        onClick={() => {
          setPendingResponse(
            "declined",
          );
          setMessage("");
        }}
        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        Decline
      </button>
    </div>
  );
}
