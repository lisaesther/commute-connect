type JourneyCardProps = {
  driverName: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  matchNote: string;
};

export function JourneyCard({
  driverName,
  origin,
  destination,
  date,
  departureTime,
  availableSeats,
  price,
  matchNote,
}: JourneyCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">{matchNote}</p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {origin} → {destination}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Driver: <span className="font-medium">{driverName}</span>
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <p>
              <span className="font-medium">Date:</span> {date}
            </p>
            <p>
              <span className="font-medium">Time:</span> {departureTime}
            </p>
            <p>
              <span className="font-medium">Seats:</span> {availableSeats}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 px-5 py-4 text-center">
          <p className="text-sm text-slate-600">Suggested contribution</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">€{price}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Request seat
        </button>

        <button className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          View details
        </button>
      </div>
    </article>
  );
}
