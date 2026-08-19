import Link from "next/link";

import { PassengerBookingRequestActions } from "@/components/bookings/PassengerBookingRequestActions";

export type PassengerBookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn";

export type PassengerBookingSummary = {
  bookingRequestId: string;
  journeyId: string;
  driverName: string;
  origin: string;
  destination: string;
  departureAt: string;
  seatsRequested: number;
  bookingStatus: PassengerBookingStatus;
  journeyStatus: string;
  suggestedContribution: number | null;
  requestedAt: string;
  respondedAt: string | null;
  withdrawnAt: string | null;
  pickupDetails: string | null;
  dropoffDetails: string | null;
  canWithdraw: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      timeZone: "Europe/Dublin",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-IE",
    {
      timeZone: "Europe/Dublin",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function statusClasses(
  status: PassengerBookingStatus,
) {
  if (status === "accepted") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "declined") {
    return "bg-red-100 text-red-800";
  }

  if (status === "withdrawn") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-amber-100 text-amber-800";
}

function seatLabel(value: number) {
  return `${value} ${value === 1 ? "seat" : "seats"}`;
}

export function PassengerBookingList({
  bookings,
}: {
  bookings: PassengerBookingSummary[];
}) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M8 7V3" />
            <path d="M16 7V3" />
            <rect
              x="4"
              y="5"
              width="16"
              height="16"
              rx="2"
            />
            <path d="m8 14 2 2 5-5" />
          </svg>
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-950">
          No bookings yet
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          Search available journeys and request
          seats to start planning your shared
          commute.
        </p>

        <Link
          href="/journeys/search"
          className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Find a ride
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const withdrawalStatus:
          | "pending"
          | "accepted"
          | null =
          booking.bookingStatus ===
            "pending" ||
          booking.bookingStatus ===
            "accepted"
            ? booking.bookingStatus
            : null;

        return (
          <article
            key={booking.bookingRequestId}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(
                  booking.bookingStatus,
                )}`}
              >
                {booking.bookingStatus}
              </span>

              {booking.journeyStatus !==
              "open" ? (
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                  Journey{" "}
                  {booking.journeyStatus}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 break-words text-lg font-semibold leading-6 text-slate-950">
              {booking.origin}
              <span className="mx-2 text-slate-400">
                →
              </span>
              {booking.destination}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Driver:{" "}
              <strong className="font-semibold text-slate-800">
                {booking.driverName}
              </strong>
            </p>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Departure
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(
                    booking.departureAt,
                  )}{" "}
                  at{" "}
                  {formatTime(
                    booking.departureAt,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Seats
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {seatLabel(
                    booking.seatsRequested,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contribution
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {booking.suggestedContribution ===
                  null
                    ? "None"
                    : `€${booking.suggestedContribution.toFixed(
                        2,
                      )}`}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Requested
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(
                    booking.requestedAt,
                  )}{" "}
                  at{" "}
                  {formatTime(
                    booking.requestedAt,
                  )}
                </p>
              </div>
            </div>

            {booking.bookingStatus ===
            "pending" ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Waiting for the driver to accept or
                decline your seat request.
              </div>
            ) : null}

            {booking.bookingStatus ===
              "accepted" ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-950">
                  Booking accepted
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  Your seats have been confirmed by
                  the driver.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Pickup instructions
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-800">
                      {booking.pickupDetails ||
                        "No private pickup instructions were provided."}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Drop-off instructions
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-800">
                      {booking.dropoffDetails ||
                        "No private drop-off instructions were provided."}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-emerald-800">
                  These coordination details are
                  private and are available because
                  this booking has been accepted.
                </p>
              </div>
            ) : null}

            {booking.bookingStatus ===
              "declined" &&
            booking.respondedAt ? (
              <p className="mt-4 text-sm text-slate-500">
                Driver responded{" "}
                {formatDate(
                  booking.respondedAt,
                )}{" "}
                at{" "}
                {formatTime(
                  booking.respondedAt,
                )}
                .
              </p>
            ) : null}

            {booking.bookingStatus ===
              "withdrawn" &&
            booking.withdrawnAt ? (
              <p className="mt-4 text-sm text-slate-500">
                Withdrawn{" "}
                {formatDate(
                  booking.withdrawnAt,
                )}{" "}
                at{" "}
                {formatTime(
                  booking.withdrawnAt,
                )}
                .
              </p>
            ) : null}

            {booking.canWithdraw &&
            withdrawalStatus ? (
              <PassengerBookingRequestActions
                bookingRequestId={
                  booking.bookingRequestId
                }
                bookingStatus={
                  withdrawalStatus
                }
                driverName={
                  booking.driverName
                }
                seatsRequested={
                  booking.seatsRequested
                }
              />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
