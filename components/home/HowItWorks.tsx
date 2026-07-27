const steps = [
  {
    number: "01",
    title: "Search or post a journey",
    description:
      "Passengers search using their route, date, preferred time, and required seats. Drivers can post the journeys they are already planning to make.",
  },
  {
    number: "02",
    title: "Get suitable matches",
    description:
      "The system compares origin, destination, journey time, available seats, and selected trust preferences.",
  },
  {
    number: "03",
    title: "Request or accept a seat",
    description:
      "Passengers request a seat on a suitable journey. Drivers review each request and choose whether to accept or reject it.",
  },
  {
    number: "04",
    title: "Confirm and travel safely",
    description:
      "After acceptance, the journey is confirmed and the users can securely coordinate the final pickup details.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Simple journey process
          </p>

          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
          >
            How CommuteConnect works
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            CommuteConnect supports the complete carpooling process, from
            discovering a suitable journey to confirming the shared commute.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-6 text-lg font-semibold text-slate-950">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm leading-6 text-emerald-900">
            Exact pickup information remains private and is shared only after
            the driver accepts the passenger&apos;s booking request.
          </p>
        </div>
      </div>
    </section>
  );
}
