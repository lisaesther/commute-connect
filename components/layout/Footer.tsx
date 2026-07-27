import Link from "next/link";

const exploreLinks = [
  {
    label: "Find a Ride",
    href: "/#journey-search",
  },
  {
    label: "Post a Journey",
    href: "/journeys/new",
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
  },
  {
    label: "Safety",
    href: "/#safety",
  },
];

const accountLinks = [
  {
    label: "Login",
    href: "/login",
  },
  {
    label: "Register",
    href: "/register",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-white transition hover:text-emerald-300"
            >
              CommuteConnect Ireland
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              A trust-first carpooling platform designed to help Irish drivers
              and passengers share regular journeys more safely and
              efficiently.
            </p>

            <p className="mt-5 text-sm font-medium text-emerald-300">
              Smarter commutes. Safer shared journeys.
            </p>
          </div>

          <nav aria-label="Explore CommuteConnect">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h2>

            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account links">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Account
            </h2>

            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Project
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Developed as a postgraduate software project focused on
              carpooling, sustainable commuting, trust, and user-centred
              design.
            </p>

            <a
              href="https://github.com/lisaesther/commute-connect"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              View project on GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} CommuteConnect Ireland. All rights reserved.
          </p>

          <p>Designed for commuters across Ireland.</p>
        </div>
      </div>
    </footer>
  );
}
