"use client";

import { useState } from "react";

type AiMatchExplanationProps = {
  originName: string;
  destinationName: string;
  departureAt: string;
  requestedSeats: number;
  availableSeats: number;
  originDistanceMeters: number;
  destinationDistanceMeters: number;
  timeDifferenceMinutes: number;
};

type MatchExplanation = {
  summary: string;
  reasons: string[];
};

type MatchExplanationResponse = {
  explanation?: MatchExplanation;
  error?: string;
};

export function AiMatchExplanation({
  originName,
  destinationName,
  departureAt,
  requestedSeats,
  availableSeats,
  originDistanceMeters,
  destinationDistanceMeters,
  timeDifferenceMinutes,
}: AiMatchExplanationProps) {
  const [explanation, setExplanation] =
    useState<MatchExplanation | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  async function handleExplainMatch() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/ai/match-explanation",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            originName,
            destinationName,
            departureAt,
            requestedSeats,
            availableSeats,
            originDistanceMeters,
            destinationDistanceMeters,
            timeDifferenceMinutes,
          }),
        },
      );

      const data =
        (await response.json()) as MatchExplanationResponse;

      if (
        !response.ok ||
        !data.explanation
      ) {
        throw new Error(
          data.error ??
            "AI match explanation is temporarily unavailable.",
        );
      }

      setExplanation(
        data.explanation,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AI match explanation is temporarily unavailable.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            AI Match Insight
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Get a short AI-generated explanation of why this journey matched your search.
          </p>
        </div>

        {!explanation && (
          <button
            type="button"
            onClick={
              handleExplainMatch
            }
            disabled={isLoading}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Explaining..."
              : "Explain this match"}
          </button>
        )}
      </div>

      {explanation && (
        <div className="mt-4 rounded-lg border border-violet-200 bg-white p-4">
          <p className="text-sm font-semibold leading-6 text-slate-900">
            {
              explanation.summary
            }
          </p>

          <ul className="mt-3 space-y-2">
            {explanation.reasons.map(
              (reason, index) => (
                <li
                  key={`${index}-${reason}`}
                  className="flex gap-2 text-sm leading-6 text-slate-700"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600"
                  />

                  <span>
                    {reason}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm leading-6 text-amber-900">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={
              handleExplainMatch
            }
            disabled={isLoading}
            className="mt-2 text-sm font-semibold text-amber-900 underline underline-offset-2 disabled:opacity-60"
          >
            Try again
          </button>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        AI explains the existing match only. Journey eligibility, distance, timing and seat availability are determined by CommuteConnect&apos;s matching rules.
      </p>
    </section>
  );
}
