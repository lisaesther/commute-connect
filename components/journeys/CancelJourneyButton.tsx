"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CancelJourneyButtonProps = {
  journeyId: string;
};

export function CancelJourneyButton({ journeyId }: CancelJourneyButtonProps) {
  const router = useRouter();

  const [isConfirming, setIsConfirming] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [error, setError] = useState("");

  async function cancelJourney() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);
    setError("");

    const supabase = createClient();

    const { error: cancelError } = await supabase.rpc("cancel_journey", {
      p_journey_id: journeyId,
    });

    if (cancelError) {
      console.error("Journey cancellation failed:", cancelError.message);

      setError(
        "We could not cancel this journey. Please refresh the page and try again.",
      );

      setIsCancelling(false);
      return;
    }

    setIsConfirming(false);
    setIsCancelling(false);

    router.refresh();
  }

  if (isConfirming) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900">
          Cancel this journey?
        </p>

        <p className="mt-2 text-sm leading-5 text-red-700">
          The journey will no longer be shown as available/upcoming. This action
          cannot be undone from the current interface.
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={cancelJourney}
            disabled={isCancelling}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? "Cancelling…" : "Confirm Cancellation"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsConfirming(false);
              setError("");
            }}
            disabled={isCancelling}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Don&apos;t Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="w-full rounded-lg border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
    >
      Cancel Journey
    </button>
  );
}
