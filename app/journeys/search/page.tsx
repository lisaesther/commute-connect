import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { JourneyCard } from "@/components/journeys/JourneyCard";

type SearchPageProps = {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
  }>;
};

const mockJourneys = [
  {
    id: "1",
    driverName: "Aoife Murphy",
    origin: "Citywest",
    destination: "Maynooth",
    date: "2026-05-18",
    departureTime: "08:00",
    availableSeats: 2,
    price: 6,
    matchNote: "Strong match based on your route",
  },
  {
    id: "2",
    driverName: "Daniel O'Brien",
    origin: "Dublin",
    destination: "Galway",
    date: "2026-05-18",
    departureTime: "09:30",
    availableSeats: 3,
    price: 18,
    matchNote: "Available on your selected date",
  },
  {
    id: "3",
    driverName: "Sarah Kelly",
    origin: "Tallaght",
    destination: "Maynooth",
    date: "2026-05-18",
    departureTime: "07:45",
    availableSeats: 1,
    price: 7,
    matchNote: "Nearby origin and matching destination",
  },
];

function normalise(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default async function JourneySearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const origin = params.origin ?? "";
  const destination = params.destination ?? "";
  const date = params.date ?? "";

  const normalisedOrigin = normalise(origin);
  const normalisedDestination = normalise(destination);

  const matchingJourneys = mockJourneys.filter((journey) => {
    const journeyOrigin = normalise(journey.origin);
    const journeyDestination = normalise(journey.destination);

    const originMatches =
      !normalisedOrigin || journeyOrigin.includes(normalisedOrigin);

    const destinationMatches =
      !normalisedDestination ||
      journeyDestination.includes(normalisedDestination);

    const dateMatches = !date || journey.date === date;

    return originMatches && destinationMatches && dateMatches;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Journey search
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Available carpool journeys
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Search results are currently shown using sample data. Later, this
              page will fetch real journeys from Supabase and rank them using
              location, date, time, and seat availability.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Change search
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Your search</h2>

          <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-3">
            <p>
              <span className="font-medium">From:</span>{" "}
              {origin || "Any origin"}
            </p>
            <p>
              <span className="font-medium">To:</span>{" "}
              {destination || "Any destination"}
            </p>
            <p>
              <span className="font-medium">Date:</span> {date || "Any date"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">
              {matchingJourneys.length} result
              {matchingJourneys.length === 1 ? "" : "s"} found
            </h2>
          </div>

          {matchingJourneys.length > 0 ? (
            <div className="grid gap-5">
              {matchingJourneys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  driverName={journey.driverName}
                  origin={journey.origin}
                  destination={journey.destination}
                  date={journey.date}
                  departureTime={journey.departureTime}
                  availableSeats={journey.availableSeats}
                  price={journey.price}
                  matchNote={journey.matchNote}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-slate-950">
                No journeys found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Try changing the origin, destination, or date. Once the database
                is connected, this page will search real journeys posted by
                drivers.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Search again
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
