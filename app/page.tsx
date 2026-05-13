import { CommuteSearchForm } from "@/components/forms/CommuteSearchForm";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Smart carpooling for Irish commuters
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
          Share your journey, reduce commute costs, and travel smarter.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          CommuteConnect Ireland helps drivers and passengers find compatible
          journeys based on route, date, time, and available seats.
        </p>

        <CommuteSearchForm />

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 text-left md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">For passengers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Search for affordable rides when public transport is delayed,
              unavailable, or inconvenient.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">For drivers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Offer spare seats, reduce fuel costs, and make your regular
              commute more efficient.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">For Ireland</h2>
            <p className="mt-2 text-sm text-slate-600">
              Encourage shared travel, reduce solo car journeys, and support
              more sustainable commuting.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
