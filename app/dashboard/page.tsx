import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          User dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Your commute dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          This dashboard is currently a frontend prototype. It will later show
          real user data from Supabase, including posted journeys, booking
          requests, saved routes, and journey history.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Upcoming journeys</h2>
            <p className="mt-2 text-3xl font-bold text-emerald-700">0</p>
            <p className="mt-2 text-sm text-slate-600">
              Accepted or upcoming journeys will appear here.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Booking requests</h2>
            <p className="mt-2 text-3xl font-bold text-emerald-700">0</p>
            <p className="mt-2 text-sm text-slate-600">
              Passenger requests and driver responses will be tracked here.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Estimated savings</h2>
            <p className="mt-2 text-3xl font-bold text-emerald-700">€0</p>
            <p className="mt-2 text-sm text-slate-600">
              Cost-sharing and savings analytics will be calculated later.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            Next planned features
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>✅ Frontend login and registration pages</li>
            <li>✅ Client-side validation using Zod</li>
            <li>✅ Search journey UI and mock results</li>
            <li>Next: connect Supabase Auth</li>
            <li>Next: create journey posting form</li>
            <li>Next: replace mock journeys with database records</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Back home
          </Link>

          <Link
            href="/journeys/search"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            View journeys
          </Link>
        </div>
      </section>
    </main>
  );
}
