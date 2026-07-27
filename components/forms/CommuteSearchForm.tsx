"use client";

import { useState } from "react";

export function CommuteSearchForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("1");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchParams = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      date,
      time,
      seats,
    });

    window.location.href = `/journeys/search?${searchParams.toString()}`;
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto mt-8 grid max-w-6xl gap-4 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-2 xl:grid-cols-[2fr_2fr_1fr_1fr_1fr]"
    >
      <div className="xl:col-span-2">
        <label
          htmlFor="origin"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          From
        </label>

        <input
          id="origin"
          name="origin"
          type="text"
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
          placeholder="e.g. Dublin City Centre"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="xl:col-span-2">
        <label
          htmlFor="destination"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          To
        </label>

        <input
          id="destination"
          name="destination"
          type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="e.g. Maynooth"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Date
        </label>

        <input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="time"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Preferred time
        </label>

        <input
          id="time"
          name="time"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="seats"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Seats needed
        </label>

        <select
          id="seats"
          name="seats"
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="1">1 seat</option>
          <option value="2">2 seats</option>
          <option value="3">3 seats</option>
          <option value="4">4 seats</option>
        </select>
      </div>

      <div className="flex justify-center md:col-span-2 xl:col-span-5">
        <button
          type="submit"
          className="w-full max-w-sm rounded-lg bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          Find a Ride
        </button>
      </div>
    </form>
  );
}
