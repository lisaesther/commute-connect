"use client";

import { useState } from "react";
import { z } from "zod";

const journeySchema = z.object({
  origin: z.string().min(2, "Origin must be at least 2 characters."),
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  departureDate: z.string().min(1, "Departure date is required."),
  departureTime: z.string().min(1, "Departure time is required."),
  availableSeats: z
    .string()
    .min(1, "Available seats is required.")
    .refine((value) => Number(value) >= 1 && Number(value) <= 8, {
      message: "Available seats must be between 1 and 8.",
    }),
  pricePerSeat: z
    .string()
    .min(1, "Suggested contribution is required.")
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, {
      message: "Suggested contribution must be between €0 and €100.",
    }),
  notes: z.string().max(300, "Notes must be under 300 characters.").optional(),
});

type JourneyErrors = {
  origin?: string[];
  destination?: string[];
  departureDate?: string[];
  departureTime?: string[];
  availableSeats?: string[];
  pricePerSeat?: string[];
  notes?: string[];
};

export function JourneyPostForm() {
  const [errors, setErrors] = useState<JourneyErrors>({});
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const values = {
      origin: String(formData.get("origin") || ""),
      destination: String(formData.get("destination") || ""),
      departureDate: String(formData.get("departureDate") || ""),
      departureTime: String(formData.get("departureTime") || ""),
      availableSeats: String(formData.get("availableSeats") || ""),
      pricePerSeat: String(formData.get("pricePerSeat") || ""),
      notes: String(formData.get("notes") || ""),
    };

    const result = journeySchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setMessage("");
      return;
    }

    setErrors({});
    setMessage(
      "Journey form validated successfully. This will be saved to Supabase once the database is connected."
    );

    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-slate-700">
            Origin
          </label>
          <input
            id="origin"
            name="origin"
            type="text"
            placeholder="e.g. Citywest"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.origin ? (
            <p className="mt-2 text-sm text-red-600">{errors.origin[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            placeholder="e.g. Maynooth"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.destination ? (
            <p className="mt-2 text-sm text-red-600">{errors.destination[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-slate-700">
            Departure date
          </label>
          <input
            id="departureDate"
            name="departureDate"
            type="date"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.departureDate ? (
            <p className="mt-2 text-sm text-red-600">{errors.departureDate[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="departureTime" className="block text-sm font-medium text-slate-700">
            Departure time
          </label>
          <input
            id="departureTime"
            name="departureTime"
            type="time"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.departureTime ? (
            <p className="mt-2 text-sm text-red-600">{errors.departureTime[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="availableSeats" className="block text-sm font-medium text-slate-700">
            Available seats
          </label>
          <input
            id="availableSeats"
            name="availableSeats"
            type="number"
            min="1"
            max="8"
            placeholder="e.g. 2"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.availableSeats ? (
            <p className="mt-2 text-sm text-red-600">{errors.availableSeats[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="pricePerSeat" className="block text-sm font-medium text-slate-700">
            Suggested contribution per seat
          </label>
          <input
            id="pricePerSeat"
            name="pricePerSeat"
            type="number"
            min="0"
            step="0.50"
            placeholder="e.g. 6"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.pricePerSeat ? (
            <p className="mt-2 text-sm text-red-600">{errors.pricePerSeat[0]}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes for passengers
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Example: I usually leave from Citywest Shopping Centre car park."
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.notes ? (
          <p className="mt-2 text-sm text-red-600">{errors.notes[0]}</p>
        ) : null}
      </div>

      {message ? (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        Post journey
      </button>
    </form>
  );
}
