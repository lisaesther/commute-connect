import Link from "next/link";
import { JourneyPostForm } from "@/components/forms/JourneyPostForm";
import { Navbar } from "@/components/layout/Navbar";

export default function NewJourneyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Driver journey posting
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Post a carpool journey
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Drivers can use this form to share their route, departure time,
              available seats, and suggested contribution. This is currently a
              frontend prototype and will later save journeys to Supabase.
            </p>

            <JourneyPostForm />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-950">
                What this feature demonstrates
              </h2>

              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>✅ Driver journey creation workflow</li>
                <li>✅ Route input for origin and destination</li>
                <li>✅ Date and time collection</li>
                <li>✅ Seat availability input</li>
                <li>✅ Suggested cost-sharing input</li>
                <li>✅ Client-side validation using Zod</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-6">
              <h2 className="font-semibold text-emerald-900">
                Next backend step
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                After Supabase is connected, this form will insert records into
                a journeys table. Later, origin and destination will be converted
                into coordinates for distance-based matching.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="block rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to dashboard
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
