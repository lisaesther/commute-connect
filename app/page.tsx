import Link from "next/link";

import { CommuteSearchForm } from "@/components/forms/CommuteSearchForm";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustFeatures } from "@/components/home/TrustFeatures";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <section className="bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            Trust-first carpooling for Irish commuters
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Smarter commutes.
            <span className="block text-emerald-700">
              Safer shared journeys.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            CommuteConnect Ireland helps drivers and passengers share regular
            journeys based on route, date, time, available seats, and trusted
            preferences.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#journey-search"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 sm:w-auto"
            >
              Find a Ride
            </a>

            <Link
              href="/journeys/new"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto"
            >
              Post a Journey
            </Link>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-slate-500">
            Designed for commuters facing traffic congestion, limited public
            transport options, service disruption, and high travel costs across
            Ireland.
          </p>

          <div id="journey-search" className="scroll-mt-24">
            <CommuteSearchForm />
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Exact pickup details are kept private and shared only after a
            booking request has been accepted.
          </p>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 text-left md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                👤
              </div>

              <h2 className="text-lg font-semibold text-slate-950">
                For passengers
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Find suitable journeys when public transport is delayed,
                unavailable, expensive, or inconvenient.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                🚗
              </div>

              <h2 className="text-lg font-semibold text-slate-950">
                For drivers
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Offer spare seats, share commuting costs, and make regular
                journeys more useful.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                🍀
              </div>

              <h2 className="text-lg font-semibold text-slate-950">
                For Ireland
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Encourage shared commuting, reduce solo-car journeys, and
                support more sustainable travel.
              </p>
            </article>
          </div>
        </div>
      </section>

        <HowItWorks />
        <TrustFeatures />
      </main>

      <Footer />
    </div>
  );
}
