"use client";

import { useState } from "react";

export function CommuteSearchForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchParams = new URLSearchParams({
      origin,
      destination,
      date,
    });

    window.location.href = `/journeys/search?${searchParams.toString()}`;
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto mt-8 grid max-w-4xl gap-4 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-[1fr_1fr_auto_auto]"
    >
      <div>
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
          placeholder="e.g. Dublin"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
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
          placeholder="e.g. Galway"
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

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
