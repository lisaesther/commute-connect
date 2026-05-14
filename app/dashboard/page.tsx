import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name as string | undefined;
  const role = user.user_metadata?.role as string | undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              User dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Your commute dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              You are logged in as{" "}
              <span className="font-semibold text-slate-900">
                {fullName || user.email}
              </span>
              {role ? ` with role: ${role}.` : "."}
            </p>
          </div>

          <LogoutButton />
        </div>

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

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Driver actions
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Post your commute route and allow passengers travelling in the
              same direction to request a seat.
            </p>

            <Link
              href="/journeys/new"
              className="mt-5 inline-flex rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Post a journey
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Passenger actions
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Search available journeys based on your origin, destination, and
              travel date.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Search journeys
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            Current prototype progress
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>✅ Homepage and commute search form</li>
            <li>✅ Search journey UI and mock results</li>
            <li>✅ Real Supabase Auth login and registration</li>
            <li>✅ Protected dashboard route</li>
            <li>✅ Logout functionality</li>
            <li>✅ Driver journey posting form prototype</li>
            <li>Next: create profiles table</li>
            <li>Next: save posted journeys to database</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
