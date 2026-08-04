import Link from "next/link";
import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/Navbar";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateText: string;
  alternateLinkLabel: string;
  alternateLinkHref: string;
  children: ReactNode;
};

const trustPoints = [
  "Secure account access",
  "Privacy-aware journey and pickup details",
  "Manage journeys and booking requests",
  "Optional trust and safety preferences",
];

export function AuthLayout({
  eyebrow,
  title,
  description,
  alternateText,
  alternateLinkLabel,
  alternateLinkHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto flex max-w-7xl items-center px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative overflow-hidden bg-slate-950 px-7 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
            />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                CommuteConnect Ireland
              </p>

              <h2 className="mt-5 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
                Share journeys with confidence.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-slate-300">
                Connect with commuters travelling in the same direction while
                keeping unnecessary personal and pickup information protected.
              </p>

              <ul className="mt-9 space-y-4">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                        className="h-4 w-4"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </span>

                    <span className="text-sm leading-6 text-slate-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-emerald-300">
                  Privacy by design
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Exact pickup details are not displayed publicly and are
                  shared only after a journey request is accepted.
                </p>
              </div>
            </div>
          </section>

          <section className="px-7 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div className="mx-auto max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {eyebrow}
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>

              <p className="mt-4 leading-7 text-slate-600">{description}</p>

              {children}

              <p className="mt-7 text-center text-sm text-slate-600">
                {alternateText}{" "}
                <Link
                  href={alternateLinkHref}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  {alternateLinkLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
