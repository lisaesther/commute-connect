const trustFeatures = [
  {
    title: "Same-company preference",
    description:
      "Users can choose to prioritise journeys involving people from the same company, university, or organisation.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path d="M3 21h18" />
        <path d="M6 21V7l6-4 6 4v14" />
        <path d="M9 10h1" />
        <path d="M14 10h1" />
        <path d="M9 14h1" />
        <path d="M14 14h1" />
        <path d="M10 21v-3h4v3" />
      </svg>
    ),
  },
  {
    title: "Optional safety preferences",
    description:
      "Preferences such as same-gender matching remain optional, user-controlled, and are never automatically inferred.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path d="M12 3 5 6v5c0 4.6 2.9 8.7 7 10 4.1-1.3 7-5.4 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Privacy-aware pickup",
    description:
      "Public journey listings show general pickup areas. Exact pickup information is shared only after acceptance.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Reviews and reporting",
    description:
      "After completed journeys, users can leave reviews and report unsafe behaviour, inaccurate details, or misuse.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    ),
  },
];

export function TrustFeatures() {
  return (
    <section
      id="safety"
      aria-labelledby="trust-features-heading"
      className="bg-slate-950 py-16 text-white md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Trust and safety
            </p>

            <h2
              id="trust-features-heading"
              className="mt-3 text-3xl font-bold tracking-tight md:text-4xl"
            >
              Designed around user control, privacy, and safer commuting
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              CommuteConnect uses trust signals and privacy-aware design to
              support safer connections without exposing unnecessary personal
              information.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-emerald-300">
                Safety principle
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Preferences assist users in finding suitable journeys. They do
                not replace identity checks, personal judgement, reporting
                tools, or responsible travel practices.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {trustFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
